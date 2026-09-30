import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { StoredProperty, PropertyVisit } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateProOwnerRouter = Router();

// GET /owner/properties
realEstateProOwnerRouter.get(
  '/owner/properties',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const ownerId = req.user.uid;

    try {
      if (!db) {
        return res.json({ success: true, data: [] });
      }

      const snapshot = await db
        .collection('real_estate_properties')
        .where('ownerId', '==', ownerId)
        .get();

      const ownerProperties: StoredProperty[] = [];
      snapshot.forEach((doc) => {
        ownerProperties.push({ ...(doc.data() as StoredProperty), id: doc.id });
      });

      ownerProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        data: ownerProperties,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching owner properties', { ownerId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de vos annonces.' });
    }
  }
);

// GET /owner/visits
realEstateProOwnerRouter.get(
  '/owner/visits',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const ownerId = req.user.uid;

    try {
      if (!db) {
        return res.json({ success: true, data: [] });
      }

      const snapshot = await db
        .collection('real_estate_visits')
        .where('ownerId', '==', ownerId)
        .get();

      const visits: PropertyVisit[] = [];
      snapshot.forEach((doc) => {
        visits.push({ ...(doc.data() as PropertyVisit), id: doc.id });
      });

      visits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        data: visits,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching owner visit requests', { ownerId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes de visite.' });
    }
  }
);

// POST /upload-image
realEstateProOwnerRouter.post(
  '/upload-image',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, error: "Données d'image invalides ou manquantes." });
    }

    const validDataUrlRegex = /^data:image\/(jpeg|png|webp|avif);base64,/;
    const isValidDataUrl = validDataUrlRegex.test(imageData);
    const isHttpUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

    if (!isValidDataUrl && !isHttpUrl) {
      return res.status(400).json({
        success: false,
        error: "Format d'image non supporté. Formats acceptés : JPEG, PNG, WEBP, AVIF ou URL HTTP(S).",
      });
    }

    if (isValidDataUrl) {
      const base64Length = imageData.length - imageData.indexOf(',') - 1;
      const sizeInBytes = (base64Length * 3) / 4;
      const maxSizeBytes = 10 * 1024 * 1024;

      if (sizeInBytes > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          error: "L'image dépasse la taille maximale autorisée de 10 Mo.",
        });
      }
    }

    return res.json({
      success: true,
      data: {
        url: imageData,
      },
    });
  }
);

// POST /owner/enable
realEstateProOwnerRouter.post(
  '/owner/enable',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ success: false, error: 'Profil utilisateur introuvable.' });
      }

      const userData = userSnap.data() || {};
      const currentCapabilities: string[] = Array.isArray(userData.capabilities) ? userData.capabilities : [];

      if (!currentCapabilities.includes('property_owner')) {
        const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
        if (!isServerAdmin) {
          const appRef = db.collection('real_estate_pro_applications').doc(uid);
          await appRef.set(
            {
              userId: uid,
              userEmail: req.user.email || '',
              status: 'pending',
              requestedCapability: 'property_owner',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          safeLogger.info('Property owner application submitted for admin approval', { uid });
          return res.json({
            success: true,
            message: "Demande d'activation du rôle de propriétaire enregistrée. En attente de validation administrateur.",
            pending: true,
          });
        }

        const updatedCapabilities = [...currentCapabilities, 'property_owner'];
        const updateData: Record<string, unknown> = {
          capabilities: updatedCapabilities,
          updatedAt: new Date().toISOString(),
        };

        if (userData.role === 'buyer') {
          updateData.role = 'property_owner';
        }

        await userRef.update(updateData);
        safeLogger.info('Capability property_owner enabled by admin', { uid });
      } else {
        safeLogger.info('Capability property_owner already active', { uid });
      }

      return res.json({
        success: true,
        message: 'Rôle de propriétaire immobilier activé avec succès.',
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error enabling property owner role', { uid, err: errorMsg });
      return res.status(500).json({ success: false, error: "Erreur lors de l'activation du rôle." });
    }
  }
);
