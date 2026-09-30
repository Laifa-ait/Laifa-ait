import { Router, Response } from 'express';
import { admin, db } from '../../../config/firebase-admin';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { StoredProperty } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';
import { toPublicPropertyDTO } from '../services/realEstateDTO';

export const realEstateDetailsRouter = Router();

// GET /properties/:id
realEstateDetailsRouter.get(
  '/properties/:id',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });

    try {
      let property: StoredProperty | null = null;
      if (db) {
        const docRef = db.collection('real_estate_properties').doc(id);
        const snap = await docRef.get();
        if (snap.exists) {
          property = snap.data() as StoredProperty;
          property.id = snap.id;
          if (property.status === 'active' && (!req.user || req.user.uid !== property.ownerId)) {
            docRef.update({ viewsCount: admin.firestore.FieldValue.increment(1) }).catch((err) => {
              console.warn('[OlmaImmo Views] Failed to increment view count:', err);
            });
            property.viewsCount = (property.viewsCount || 0) + 1;
          }
        }
      }

      if (!property) return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });

      const nonPublicStatuses = ['draft', 'archived', 'pending', 'rejected'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          safeLogger.warn('Unauthorized access attempt on non-public property', { propertyId: id, status: property.status, callerUid: callerUid || 'anonymous' });
          return res.status(403).json({ success: false, error: 'Cette annonce n\'est pas accessible au public.' });
        }
      }

      return res.json({ success: true, data: toPublicPropertyDTO(property) });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property detail', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'annonce.' });
    }
  }
);

// GET /properties/:id/owner
realEstateDetailsRouter.get(
  '/properties/:id/owner',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });

    try {
      if (!db) return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });

      const property = snap.data() as StoredProperty;
      const nonPublicStatuses = ['draft', 'archived', 'pending', 'rejected'];
      if (nonPublicStatuses.includes(property.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!callerUid || (callerUid !== property.ownerId && !isServerAdmin)) {
          return res.status(403).json({ success: false, error: 'Cette annonce n\'est pas accessible au public.' });
        }
      }

      const userSnap = await db.collection('users').doc(property.ownerId).get();
      if (!userSnap.exists) return res.status(404).json({ success: false, error: 'Profil de l\'annonceur introuvable.' });

      const userData = userSnap.data();
      const publicProfile = {
        displayName: userData?.displayName || 'Annonceur',
        photoURL: userData?.photoURL || '',
        role: userData?.role || 'buyer',
        shopName: userData?.shopName,
        sellerType: userData?.sellerType,
        verificationStatus: userData?.verificationStatus === 'approved' ? ('approved' as const) : ('unverified' as const),
        joinedAt: typeof userData?.createdAt === 'string' ? userData.createdAt : userData?.createdAt?.toDate?.()?.toISOString(),
      };

      return res.json({ success: true, data: publicProfile });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching property owner profile', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du profil.' });
    }
  }
);

// GET /properties/:id/similar
realEstateDetailsRouter.get(
  '/properties/:id/similar',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });

    try {
      if (!db) return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      const snap = await db.collection('real_estate_properties').doc(id).get();
      if (!snap.exists) return res.status(404).json({ success: false, error: 'Annonce introuvable.' });

      const targetProp = snap.data() as StoredProperty;
      targetProp.id = snap.id;

      const nonPublicStatuses = ['draft', 'pending', 'archived', 'rejected'];
      if (nonPublicStatuses.includes(targetProp.status)) {
        const callerUid = req.user?.uid;
        const isServerAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!callerUid || (callerUid !== targetProp.ownerId && !isServerAdmin)) {
          return res.status(403).json({ success: false, error: 'Cette annonce n\'est pas accessible au public.' });
        }
      }

      const candidates: StoredProperty[] = [];
      let query = db.collection('real_estate_properties').where('status', '==', 'active');
      if (targetProp?.location?.wilaya) {
        query = query.where('location.wilaya', '==', targetProp.location.wilaya);
      }
      const listSnap = await query.limit(10).get();
      listSnap.forEach((doc) => {
        if (doc.id !== id) candidates.push({ ...(doc.data() as StoredProperty), id: doc.id });
      });

      return res.json({ success: true, data: candidates.slice(0, 4).map(toPublicPropertyDTO) });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching similar properties', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la recherche d\'annonces similaires.' });
    }
  }
);
