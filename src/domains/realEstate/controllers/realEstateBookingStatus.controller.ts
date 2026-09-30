import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest } from '../../../middlewares/validation';
import { BookingStatusUpdateSchema } from '../../../schemas/realEstate';
import { BookingShort } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateBookingStatusRouter = Router();

// PUT /bookings/:id/status
realEstateBookingStatusRouter.put(
  '/bookings/:id/status',
  strictLimiter,
  authenticateToken,
  validateRequest(BookingStatusUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const bookingId = req.params.id;
    const { status: targetStatus } = req.body;
    const callerUid = req.user?.uid;

    if (!callerUid) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const updatedBooking = await db.runTransaction(async (transaction) => {
        const docRef = db!.collection('real_estate_bookings').doc(bookingId);
        const snap = await transaction.get(docRef);

        if (!snap.exists) {
          throw new Error('BOOKING_NOT_FOUND');
        }

        const booking = snap.data() as BookingShort;
        const isOwner = booking.ownerId === callerUid;
        const isTenant = booking.tenantId === callerUid;
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isTenant && !isAdmin) {
          throw new Error('UNAUTHORIZED');
        }

        const currentStatus = booking.status;

        if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
          throw new Error('INVALID_STATUS_TRANSITION');
        }

        if (currentStatus === 'completed' && targetStatus !== 'completed') {
          throw new Error('INVALID_STATUS_TRANSITION');
        }

        if (targetStatus === 'confirmed' || targetStatus === 'rejected') {
          if (!isOwner && !isAdmin) {
            throw new Error('ONLY_OWNER_CAN_CONFIRM_OR_REJECT');
          }
        }

        if (targetStatus === 'cancelled') {
          if (!isOwner && !isTenant && !isAdmin) {
            throw new Error('UNAUTHORIZED');
          }
        }

        const now = new Date().toISOString();
        const updated = {
          ...booking,
          status: targetStatus,
          updatedAt: now,
        };

        transaction.update(docRef, {
          status: targetStatus,
          updatedAt: now,
        });

        return updated;
      });

      safeLogger.info('Booking status updated', { bookingId, targetStatus, callerUid });

      return res.json({
        success: true,
        data: updatedBooking,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg === 'BOOKING_NOT_FOUND') {
        return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      }
      if (errorMsg === 'UNAUTHORIZED' || errorMsg === 'ONLY_OWNER_CAN_CONFIRM_OR_REJECT') {
        return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à modifier cette réservation.' });
      }
      if (errorMsg === 'INVALID_STATUS_TRANSITION') {
        return res.status(400).json({ success: false, error: 'Changement de statut non autorisé pour cette réservation.' });
      }
      safeLogger.error('Error updating booking status', { bookingId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du statut de la réservation.' });
    }
  }
);

// POST /bookings/:id/cancel
realEstateBookingStatusRouter.post(
  '/bookings/:id/cancel',
  strictLimiter,
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const bookingId = req.params.id;
    const callerUid = req.user?.uid;

    if (!callerUid) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
      }

      const docRef = db.collection('real_estate_bookings').doc(bookingId);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
      }

      const booking = snap.data() as BookingShort;
      const isOwner = booking.ownerId === callerUid;
      const isTenant = booking.tenantId === callerUid;

      if (!isOwner && !isTenant && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Accès refusé.' });
      }

      if (booking.status === 'cancelled' || booking.status === 'completed') {
        return res.status(400).json({ success: false, error: 'La réservation ne peut plus être annulée.' });
      }

      const now = new Date().toISOString();
      await docRef.update({
        status: 'cancelled',
        updatedAt: now,
      });

      return res.json({
        success: true,
        data: {
          ...booking,
          status: 'cancelled',
          updatedAt: now,
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      safeLogger.error('Error cancelling booking', { bookingId, callerUid, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation de la réservation.' });
    }
  }
);
