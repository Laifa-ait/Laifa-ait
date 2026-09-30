import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { safeLogger } from '../../../utils/logger';

export const realEstateProApplicationRouter = Router();

// GET /pro-application
realEstateProApplicationRouter.get(
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
realEstateProApplicationRouter.post(
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
      return res.status(400).json({ success: false, error: "Le nom de l'entreprise ou de l'agence est requis." });
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
        error: "Le numéro d'agrément d'agence immobilière est obligatoire pour les agences.",
      });
    }

    if (!contactPhone || typeof contactPhone !== 'string' || !contactPhone.trim()) {
      return res.status(400).json({ success: false, error: 'Le numéro de téléphone professionnel est requis.' });
    }

    if (!wilaya || typeof wilaya !== 'string' || !wilaya.trim()) {
      return res.status(400).json({ success: false, error: "La wilaya d'exercice est requise." });
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
