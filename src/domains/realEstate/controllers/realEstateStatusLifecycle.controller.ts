import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { PropertyStatusEnum } from '../../../schemas/realEstate';
import { StoredProperty } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateStatusLifecycleRouter = Router();

// PUT /properties/:id/status
realEstateStatusLifecycleRouter.put(
  '/properties/:id/status',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentification requise.' });

    const { id } = req.params;
    const { status } = req.body;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!id || !status) return res.status(400).json({ success: false, error: 'Identifiant et statut requis.' });

    const parseResult = PropertyStatusEnum.safeParse(status);
    if (!parseResult.success) return res.status(400).json({ success: false, error: 'Statut demandé invalide.' });
    const targetStatus = parseResult.data;

    try {
      if (!db) return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });

      const existingProperty = snap.data() as StoredProperty;
      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.' });
      }

      if (!isServerAdmin) {
        const currentStatus = existingProperty.status || 'draft';
        const allowedOwnerTransitions: Record<string, string[]> = {
          draft: ['draft', 'pending', 'active', 'archived'],
          pending: ['draft', 'archived'],
          active: ['paused', 'rented', 'sold', 'archived'],
          paused: ['active', 'rented', 'sold', 'archived'],
          rented: ['active', 'paused', 'archived'],
          sold: ['archived'],
          archived: ['draft', 'pending'],
          rejected: ['draft', 'pending'],
        };
        const allowedTargets = allowedOwnerTransitions[currentStatus] || [];
        if (!allowedTargets.includes(targetStatus)) {
          return res.status(403).json({ success: false, error: `Transition de statut non autorisée depuis '${currentStatus}' vers '${targetStatus}'.` });
        }
      }

      await docRef.update({ status: targetStatus, updatedAt: new Date().toISOString() });
      return res.json({ success: true, message: 'Statut mis à jour avec succès.', status: targetStatus });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating property status', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut.' });
    }
  }
);

// DELETE /properties/:id
realEstateStatusLifecycleRouter.delete(
  '/properties/:id',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentification requise.' });

    const { id } = req.params;
    const callerUid = req.user.uid;
    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!id) return res.status(400).json({ success: false, error: 'Identifiant d\'annonce manquant.' });

    try {
      if (!db) return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });

      const existingProperty = snap.data() as StoredProperty;
      if (existingProperty.ownerId !== callerUid && !isServerAdmin) {
        safeLogger.warn('IDOR deletion attempt blocked on RealEstate Property', { propertyId: id, callerUid });
        return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette annonce.' });
      }

      await docRef.delete();
      safeLogger.info('RealEstate Property deleted', { propertyId: id, callerUid });
      return res.json({ success: true, message: 'Annonce supprimée avec succès.' });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error deleting real estate property', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'annonce.' });
    }
  }
);

// PUT /properties/:id/verify-legal
realEstateStatusLifecycleRouter.put(
  '/properties/:id/verify-legal',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentification requise.' });

    const isServerAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isServerAdmin) {
      return res.status(403).json({ success: false, error: 'Accès refusé. Réservé aux administrateurs.' });
    }

    const { id } = req.params;
    const { isLegalVerified } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'Identifiant requis.' });

    try {
      if (!db) return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      const docRef = db.collection('real_estate_properties').doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return res.status(404).json({ success: false, error: 'Annonce immobilière introuvable.' });

      const verified = Boolean(isLegalVerified);
      await docRef.update({
        isLegalVerified: verified,
        updatedAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        isLegalVerified: verified,
        message: 'Statut de vérification légale mis à jour avec succès.',
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error updating legal verification status', { propertyId: id, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour.' });
    }
  }
);

