import crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest } from '../../../middlewares/validation';
import { PropertyVisitCreateSchema, PropertyVisitUpdateStatusSchema } from '../../../schemas/realEstate';
import { StoredProperty, PropertyVisit } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateVisitsRouter = Router();

// GET /my-visits (Dedicated direct route for visitor/tenant visits)
realEstateVisitsRouter.get('/my-visits', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const callerUid = req.user?.uid;
  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    const snap = await db
      .collection('real_estate_visits')
      .where('visitorId', '==', callerUid)
      .get();

    const visits = snap.docs.map((doc) => ({ ...(doc.data() as PropertyVisit), id: doc.id }));
    visits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: visits,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error('Error listing tenant my-visits', { callerUid, err: errorMsg });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de vos demandes de visite.' });
  }
});

// POST /visits
realEstateVisitsRouter.post(
  '/visits',
  strictLimiter,
  optionalAuthenticateToken,
  validateRequest(PropertyVisitCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const { propertyId, visitorName, visitorPhone, preferredDate, timeSlot } = req.body;
    const visitorId = req.user?.uid || null;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const propSnap = await db.collection('real_estate_properties').doc(propertyId).get();
      if (!propSnap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const propertyData = propSnap.data() as StoredProperty;
      const visitId = `VISIT-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
      const now = new Date().toISOString();

      const visit: PropertyVisit = {
        id: visitId,
        propertyId,
        ownerId: propertyData.ownerId,
        visitorId,
        visitorName,
        visitorPhone,
        preferredDate,
        timeSlot,
        status: 'pending',
        createdAt: now,
      };

      await db.collection('real_estate_visits').doc(visitId).set(visit);

      safeLogger.info('RealEstate Visit requested', { visitId, propertyId });

      return res.status(201).json({
        success: true,
        data: visit,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error requesting property visit', { propertyId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la demande de visite.' });
    }
  }
);

// PUT /visits/:id/status
realEstateVisitsRouter.put(
  '/visits/:id/status',
  strictLimiter,
  authenticateToken,
  validateRequest(PropertyVisitUpdateStatusSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const visitId = req.params.id;
    const { status } = req.body;
    const callerUid = req.user?.uid;

    if (!callerUid) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const visitRef = db.collection('real_estate_visits').doc(visitId);
      const visitSnap = await visitRef.get();

      if (!visitSnap.exists) {
        return res.status(404).json({ success: false, error: 'Demande de visite introuvable.' });
      }

      const visitData = visitSnap.data() as PropertyVisit;

      const isOwner = visitData.ownerId === callerUid;
      const isVisitor = visitData.visitorId === callerUid;

      if (!isOwner && !isVisitor && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas autorisé à modifier cette visite.' });
      }

      await visitRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      safeLogger.info('Visit request status updated', { visitId, status, callerUid });

      return res.json({
        success: true,
        data: {
          ...visitData,
          status,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating visit status', { visitId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut de la visite.' });
    }
  }
);
