import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import {
  authenticateToken,
  authorizePropertyOwner,
  authorizeAdmin,
  AuthenticatedRequest,
} from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { Property, PropertyVisit } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';
import { SEED_REAL_ESTATE_PROPERTIES } from '../data/realEstateSeed';

export const realEstateProAppRouter = Router();

// GET /owner/properties
realEstateProAppRouter.get(
  '/owner/properties',
  authenticateToken,
  authorizePropertyOwner,
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

      const ownerProperties: Property[] = [];
      snapshot.forEach((doc) => {
        ownerProperties.push({ ...(doc.data() as Property), id: doc.id });
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
realEstateProAppRouter.get(
  '/owner/visits',
  authenticateToken,
  authorizePropertyOwner,
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
realEstateProAppRouter.post(
  '/upload-image',
  authenticateToken,
  authorizePropertyOwner,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, error: 'Données d\'image invalides ou manquantes.' });
    }

    const validDataUrlRegex = /^data:image\/(jpeg|png|webp|avif);base64,/;
    const isValidDataUrl = validDataUrlRegex.test(imageData);
    const isHttpUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

    if (!isValidDataUrl && !isHttpUrl) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'image non supporté. Formats acceptés : JPEG, PNG, WEBP, AVIF ou URL HTTP(S).',
      });
    }

    if (isValidDataUrl) {
      const base64Length = imageData.length - imageData.indexOf(',') - 1;
      const sizeInBytes = (base64Length * 3) / 4;
      const maxSizeBytes = 10 * 1024 * 1024;

      if (sizeInBytes > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          error: 'L\'image dépasse la taille maximale autorisée de 10 Mo.',
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
realEstateProAppRouter.post(
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
          // Register a pending application for admin approval instead of direct self-promotion
          const appRef = db.collection('real_estate_pro_applications').doc(uid);
          await appRef.set({
            userId: uid,
            userEmail: req.user.email || '',
            status: 'pending',
            requestedCapability: 'property_owner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          safeLogger.info('Property owner application submitted for admin approval', { uid });
          return res.json({
            success: true,
            message: 'Demande d\'activation du rôle de propriétaire enregistrée. En attente de validation administrateur.',
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
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'activation du rôle.' });
    }
  }
);

// GET /pro-application
realEstateProAppRouter.get(
  '/pro-application',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;

    try {
      if (!db) {
        return res.json({ success: true, data: null });
      }

      const appSnap = await db.collection('real_estate_pro_applications').doc(uid).get();
      if (!appSnap.exists) {
        return res.json({ success: true, data: null });
      }

      const data = appSnap.data();
      return res.json({
        success: true,
        data: {
          id: appSnap.id,
          ...data,
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching pro application', { uid, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la candidature.' });
    }
  }
);

// POST /pro-application
realEstateProAppRouter.post(
  '/pro-application',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const uid = req.user.uid;
    const {
      accountType,
      companyName,
      tradeRegisterNumber,
      agencyLicenseNumber,
      taxIdentificationNumber,
      contactPhone,
      wilaya,
      address,
      description,
    } = req.body;

    if (!accountType || !['pro', 'agency'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte professionnel invalide (pro ou agence requis).',
      });
    }

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({ success: false, error: 'Le nom de l\'entreprise ou de l\'agence est requis.' });
    }

    if (!tradeRegisterNumber || typeof tradeRegisterNumber !== 'string' || !tradeRegisterNumber.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de Registre de Commerce (RC) est obligatoire.',
      });
    }

    if (accountType === 'agency' && (!agencyLicenseNumber || typeof agencyLicenseNumber !== 'string' || !agencyLicenseNumber.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro d\'agrément d\'agence immobilière est obligatoire pour les agences.',
      });
    }

    if (!contactPhone || typeof contactPhone !== 'string' || !contactPhone.trim()) {
      return res.status(400).json({ success: false, error: 'Le numéro de téléphone professionnel est requis.' });
    }

    if (!wilaya || typeof wilaya !== 'string' || !wilaya.trim()) {
      return res.status(400).json({ success: false, error: 'La wilaya d\'exercice est requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const now = new Date().toISOString();
      const applicationData = {
        userId: uid,
        accountType,
        companyName: companyName.trim(),
        tradeRegisterNumber: tradeRegisterNumber.trim(),
        agencyLicenseNumber: agencyLicenseNumber ? agencyLicenseNumber.trim() : '',
        taxIdentificationNumber: taxIdentificationNumber ? taxIdentificationNumber.trim() : '',
        contactPhone: contactPhone.trim(),
        wilaya: wilaya.trim(),
        address: address ? address.trim() : '',
        description: description ? description.trim() : '',
        status: 'pending',
        submittedAt: now,
        updatedAt: now,
      };

      const batch = db.batch();

      const appRef = db.collection('real_estate_pro_applications').doc(uid);
      batch.set(appRef, applicationData, { merge: true });

      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() || {} : {};
      const currentCapabilities: string[] = Array.isArray(userData.capabilities) ? userData.capabilities : [];
      const updatedCapabilities = currentCapabilities.includes('property_owner')
        ? currentCapabilities
        : [...currentCapabilities, 'property_owner'];

      batch.set(
        userRef,
        {
          immoAccountType: accountType,
          proVerificationStatus: 'pending',
          companyName: companyName.trim(),
          capabilities: updatedCapabilities,
          updatedAt: now,
        },
        { merge: true }
      );

      const notifRef = db.collection('internal_notifications').doc();
      batch.set(notifRef, {
        type: 'REAL_ESTATE_PRO_APPLICATION',
        title: `Nouvelle demande compte ${accountType === 'agency' ? 'Agence' : 'Pro'} Immo`,
        message: `L'utilisateur "${companyName.trim()}" (RC: ${tradeRegisterNumber.trim()}) a soumis une demande de certification ${accountType}.`,
        userId: uid,
        createdAt: now,
        read: false,
      });

      await batch.commit();

      safeLogger.info('RealEstate Pro Application submitted', { uid, accountType });

      return res.status(201).json({
        success: true,
        message: 'Votre dossier de certification professionnelle a été soumis avec succès.',
        data: applicationData,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error submitting pro application', { uid, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la soumission de la candidature.' });
    }
  }
);

// POST /seed
realEstateProAppRouter.post('/seed', strictLimiter, authenticateToken, authorizeAdmin, async (_req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database unavailable.' });
    }
    const batch = db.batch();
    for (const p of SEED_REAL_ESTATE_PROPERTIES) {
      const ref = db.collection('real_estate_properties').doc(p.id);
      batch.set(ref, p);
    }
    await batch.commit();
    (global as unknown as { isSeedingCompleted?: boolean }).isSeedingCompleted = true;
    return res.json({ success: true, message: 'Seeded initial Olma Immo properties into Firestore', count: SEED_REAL_ESTATE_PROPERTIES.length });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ success: false, error: errorMsg });
  }
});
