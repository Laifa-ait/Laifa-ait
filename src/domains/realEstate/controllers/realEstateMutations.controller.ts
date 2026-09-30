import crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import {
  authenticateToken,
  AuthenticatedRequest,
} from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest } from '../../../middlewares/validation';
import {
  PropertyCreateSchema,
  PropertyUpdateSchema,
} from '../../../schemas/realEstate';
import { StoredProperty } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';
import { toPublicPropertyDTO } from '../services/realEstateDTO';
import { encodeGeohash } from '../../../services/realEstateGeo';
import { findDairaForCommune } from '../../../data/algerianCommunesDatabase';

export const realEstateMutationsRouter = Router();

// POST /properties
realEstateMutationsRouter.post(
  '/properties',
  strictLimiter,
  authenticateToken,
  validateRequest(PropertyCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const payload = req.body;
    const ownerId = req.user.uid;
    const isPro = req.user.role === 'seller' || req.user.role === 'admin';

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const propertyId = `PROP-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
      const now = new Date().toISOString();

      const lat = payload.location?.lat;
      const lng = payload.location?.lng;
      const wilaya = payload.location?.wilaya || payload.wilaya;
      const commune = payload.location?.commune || payload.commune;
      const daira = payload.location?.daira || (wilaya && commune ? findDairaForCommune(wilaya, commune) : undefined);
      const geohash = typeof lat === 'number' && typeof lng === 'number' ? encodeGeohash(lat, lng, 7) : undefined;

      const location = {
        ...(payload.location || {}),
        ...(typeof lat === 'number' ? { lat } : {}),
        ...(typeof lng === 'number' ? { lng } : {}),
        wilaya: wilaya || '',
        commune: commune || '',
        ...(daira ? { daira } : {}),
        ...(geohash ? { geohash } : {}),
      };

      const newProperty: StoredProperty = {
        ...payload,
        id: propertyId,
        ownerId,
        isPro,
        agencyName: payload.agencyName || (isPro ? 'Partenaire Immobilier Pro' : undefined),
        status: 'pending',
        isLegalVerified: false,
        moderationStatus: 'pending',
        location,
        viewsCount: 0,
        contactClicks: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('real_estate_properties').doc(propertyId).set(newProperty);

      safeLogger.info('RealEstate Property created', { propertyId, ownerId });

      return res.status(201).json({
        success: true,
        data: {
          ...toPublicPropertyDTO(newProperty),
          ownerId: newProperty.ownerId,
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error creating real estate property', { ownerId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'annonce.' });
    }
  }
);

// PUT /properties/:id
realEstateMutationsRouter.put(
  '/properties/:id',
  strictLimiter,
  authenticateToken,
  validateRequest(PropertyUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { id } = req.params;
    const updates = req.body;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });
      }

      const existingProperty = snap.data() as StoredProperty;

      // Strict IDOR protection
      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        safeLogger.warn('IDOR attempt blocked on RealEstate Property', { propertyId: id, callerUid });
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.',
        });
      }

      const sensitiveProtectedFields = ['id', 'ownerId', 'isLegalVerified', 'status', 'viewsCount', 'contactClicks', 'createdAt'];
      const sanitizedUpdates: Record<string, unknown> = {};

      Object.entries(updates).forEach(([key, val]) => {
        if (!sensitiveProtectedFields.includes(key)) {
          sanitizedUpdates[key] = val;
        }
      });

      const updatedPayload: StoredProperty = {
        ...existingProperty,
        ...sanitizedUpdates,
        id,
        ownerId: existingProperty.ownerId,
        isLegalVerified: existingProperty.isLegalVerified ?? false,
        status: existingProperty.status,
        updatedAt: new Date().toISOString(),
      };

      await docRef.set(updatedPayload, { merge: true });

      safeLogger.info('RealEstate Property updated', { propertyId: id, callerUid });

      const updatedSnap = await docRef.get();
      const updatedData = (updatedSnap.exists ? updatedSnap.data() : updatedPayload) as StoredProperty;

      return res.json({
        success: true,
        data: toPublicPropertyDTO(updatedData),
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating real estate property', { propertyId: id, callerUid, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la modification de l\'annonce.' });
    }
  }
);
