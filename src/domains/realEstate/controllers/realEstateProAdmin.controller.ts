import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import {
  authenticateToken,
  authorizeAdmin,
  AuthenticatedRequest,
} from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { safeLogger } from '../../../utils/logger';
import { SEED_REAL_ESTATE_PROPERTIES } from '../data/realEstateSeed';

export const realEstateProAdminRouter = Router();

// POST /seed
realEstateProAdminRouter.post(
  '/seed',
  strictLimiter,
  authenticateToken,
  authorizeAdmin,
  async (_req, res) => {
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
      return res.json({
        success: true,
        message: 'Seeded initial Olma Immo properties into Firestore',
        count: SEED_REAL_ESTATE_PROPERTIES.length,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ success: false, error: errorMsg });
    }
  }
);

// ADMIN ONLY: GET /admin/pro-applications
realEstateProAdminRouter.get(
  '/admin/pro-applications',
  authenticateToken,
  authorizeAdmin,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Database unavailable.' });
      }

      const snapshot = await db
        .collection('real_estate_pro_applications')
        .orderBy('submittedAt', 'desc')
        .limit(100)
        .get();

      const applications: Record<string, unknown>[] = [];
      snapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() });
      });

      return res.json({ success: true, data: applications });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error fetching admin pro applications', { err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des candidatures pro.' });
    }
  }
);

// ADMIN ONLY: PUT /admin/pro-applications/:userId/status
realEstateProAdminRouter.put(
  '/admin/pro-applications/:userId/status',
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    const targetUserId = req.params.userId;
    const { status, rejectionReason } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Identifiant utilisateur requis.' });
    }

    if (!status || !['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Statut invalide (verified, rejected ou pending).' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Database unavailable.' });
      }

      const appRef = db.collection('real_estate_pro_applications').doc(targetUserId);
      const appSnap = await appRef.get();

      if (!appSnap.exists) {
        return res.status(404).json({ success: false, error: 'Dossier de candidature introuvable.' });
      }

      const appData = appSnap.data() || {};
      const now = new Date().toISOString();
      const batch = db.batch();

      // 1. Update application status
      batch.set(
        appRef,
        {
          status,
          rejectionReason: status === 'rejected' ? (rejectionReason || 'Dossier incomplet') : null,
          reviewedAt: now,
          reviewedBy: req.user?.uid || 'admin',
          updatedAt: now,
        },
        { merge: true }
      );

      // 2. Update user profile capabilities and verification status
      const userRef = db.collection('users').doc(targetUserId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() || {} : {};
      const currentCaps: string[] = Array.isArray(userData.capabilities) ? userData.capabilities : [];

      let updatedCaps = [...currentCaps];
      if (status === 'verified') {
        if (!updatedCaps.includes('property_owner')) updatedCaps.push('property_owner');
        if (!updatedCaps.includes('pro_real_estate')) updatedCaps.push('pro_real_estate');
      } else if (status === 'rejected') {
        updatedCaps = updatedCaps.filter((c) => c !== 'pro_real_estate');
      }

      batch.set(
        userRef,
        {
          proVerificationStatus: status,
          isVerifiedPro: status === 'verified',
          immoAccountType: appData.accountType || userData.immoAccountType || 'pro',
          capabilities: updatedCaps,
          updatedAt: now,
        },
        { merge: true }
      );

      // 3. User notification
      const notifRef = db.collection('user_notifications').doc();
      batch.set(notifRef, {
        userId: targetUserId,
        type: 'REAL_ESTATE_PRO_STATUS_UPDATE',
        title: status === 'verified' ? 'Statut Professionnel Validé' : 'Dossier Professionnel Refusé',
        message:
          status === 'verified'
            ? "Félicitations ! Votre statut d'agent ou agence immobilière certifiée a été approuvé par l'administration Olmart."
            : `Votre dossier n'a pas été validé : ${rejectionReason || 'Dossier incomplet ou documents non conformes.'}`,
        createdAt: now,
        read: false,
      });

      await batch.commit();

      safeLogger.info('Admin updated real estate pro application status', {
        adminId: req.user?.uid,
        targetUserId,
        status,
      });

      return res.json({
        success: true,
        message: `Statut de candidature mis à jour avec succès : ${status}`,
        data: { userId: targetUserId, status },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating pro application status', { targetUserId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut.' });
    }
  }
);
