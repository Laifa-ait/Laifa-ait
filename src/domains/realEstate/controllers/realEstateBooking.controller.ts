import { Router, Response, Request } from 'express';
import { db } from '../../../config/firebase-admin';
import {
  authenticateToken,
  optionalAuthenticateToken,
  AuthenticatedRequest,
} from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest } from '../../../middlewares/validation';
import {
  BookingCreateSchema,
  BookingStatusUpdateSchema,
  PropertyVisitCreateSchema,
  PropertyVisitUpdateStatusSchema,
} from '../../../schemas/realEstate';
import { Property, BookingShort, PropertyVisit } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateBookingRouter = Router();

// GET /properties/:id/availability
realEstateBookingRouter.get('/properties/:id/availability', async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database unavailable.' });
    }

    const propSnap = await db.collection('real_estate_properties').doc(propertyId).get();
    if (!propSnap.exists) {
      return res.status(404).json({ success: false, error: 'Propriété introuvable.' });
    }

    const property = propSnap.data() as Property;

    const bookingsSnap = await db
      .collection('real_estate_bookings')
      .where('propertyId', '==', propertyId)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    const unavailableRanges = bookingsSnap.docs.map((doc) => {
      const data = doc.data() as BookingShort;
      return {
        id: doc.id,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status === 'confirmed' ? 'RESERVED' : 'PENDING',
      };
    });

    return res.json({
      success: true,
      propertyId,
      nightlyPrice: property.price || 0,
      listingType: property.listingType,
      cleaningFee: 10000,
      serviceFee: 5000,
      currency: 'DZD',
      unavailableRanges,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error('Error fetching property availability', { propertyId, err: errorMsg });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des disponibilités.' });
  }
});

// POST /bookings
realEstateBookingRouter.post(
  '/bookings',
  strictLimiter,
  authenticateToken,
  validateRequest(BookingCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentification requise.' });
    }

    const { propertyId, startDate, endDate, guests } = req.body;
    const tenantId = req.user.uid;

    try {
      if (!db) {
        return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
      }

      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
        return res.status(400).json({
          success: false,
          error: 'La date de fin doit être postérieure à la date de début.',
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (startDate < todayStr) {
        return res.status(400).json({
          success: false,
          error: 'La date de début ne peut pas être dans le passé.',
        });
      }

      const createdBooking: BookingShort = await db.runTransaction(async (transaction) => {
        const propRef = db!.collection('real_estate_properties').doc(propertyId);
        const propSnap = await transaction.get(propRef);

        if (!propSnap.exists) {
          throw new Error('PROPERTY_NOT_FOUND');
        }

        const propertyData = propSnap.data() as Property;

        if (propertyData.ownerId === tenantId) {
          throw new Error('SELF_BOOKING_FORBIDDEN');
        }

        if (propertyData.listingType !== 'rent_short') {
          throw new Error('NOT_SHORT_TERM_RENTAL');
        }

        if (propertyData.status !== 'active') {
          throw new Error('PROPERTY_NOT_AVAILABLE');
        }

        const existingBookingsQuery = await db!
          .collection('real_estate_bookings')
          .where('propertyId', '==', propertyId)
          .where('status', 'in', ['confirmed', 'pending'])
          .get();

        const hasOverlap = existingBookingsQuery.docs.some((doc) => {
          const b = doc.data() as BookingShort;
          return b.startDate < endDate && b.endDate > startDate;
        });

        if (hasOverlap) {
          throw new Error('BOOKING_DATE_COLLISION');
        }

        const totalNights = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
        const nightlyPrice = propertyData.price || 0;
        const subtotal = totalNights * nightlyPrice;
        const cleaningFee = propertyData.cleaningFee ?? 0;
        const serviceFee = propertyData.serviceFee ?? 0;
        const totalPriceDZD = subtotal + cleaningFee + serviceFee;

        const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const now = new Date().toISOString();

        const booking: BookingShort = {
          id: bookingId,
          propertyId,
          propertyTitle: propertyData.title,
          propertyLocation: `${propertyData.location?.commune || ''}, ${propertyData.location?.wilaya || ''}`,
          propertyImage: propertyData.images?.[0] || '',
          ownerId: propertyData.ownerId,
          tenantId,
          startDate,
          endDate,
          checkIn: startDate,
          checkOut: endDate,
          guests: guests || { adults: 1, children: 0 },
          totalNights,
          nightlyPrice,
          subtotal,
          cleaningFee,
          serviceFee,
          totalPriceDZD,
          currency: 'DZD',
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };

        const newBookingRef = db!.collection('real_estate_bookings').doc(bookingId);
        transaction.set(newBookingRef, booking);

        return booking;
      });

      safeLogger.info('RealEstate Booking created', { bookingId: createdBooking.id, propertyId, tenantId });

      return res.status(201).json({
        success: true,
        data: createdBooking,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg === 'PROPERTY_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Annonce immobilière introuvable pour la réservation.',
        });
      }
      if (errorMsg === 'SELF_BOOKING_FORBIDDEN') {
        return res.status(403).json({
          success: false,
          error: 'Vous ne pouvez pas réserver votre propre bien immobilier.',
        });
      }
      if (errorMsg === 'NOT_SHORT_TERM_RENTAL') {
        return res.status(400).json({
          success: false,
          error: 'Cette annonce n\'est pas disponible pour la location courte durée.',
        });
      }
      if (errorMsg === 'PROPERTY_NOT_AVAILABLE') {
        return res.status(400).json({
          success: false,
          error: 'Cette annonce n\'est pas disponible pour la réservation actuellement.',
        });
      }
      if (errorMsg === 'BOOKING_DATE_COLLISION') {
        return res.status(409).json({
          success: false,
          error: 'Ce bien est déjà réservé ou fait l\'objet d\'une demande pour les dates sélectionnées.',
        });
      }
      safeLogger.error('Error creating real estate booking', { propertyId, tenantId, err: errorMsg });
      return res.status(500).json({ success: false, error: 'Erreur lors de la réservation.' });
    }
  }
);

// GET /bookings
realEstateBookingRouter.get('/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const callerUid = req.user?.uid;
  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  const role = (req.query.role as string) || 'tenant';
  const statusFilter = req.query.status as string;

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    let query: FirebaseFirestore.Query = db.collection('real_estate_bookings');

    if (role === 'owner') {
      query = query.where('ownerId', '==', callerUid);
    } else {
      query = query.where('tenantId', '==', callerUid);
    }

    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const snap = await query.get();
    const bookings = snap.docs.map((doc) => doc.data() as BookingShort);

    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: bookings,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error('Error listing bookings', { callerUid, err: errorMsg });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des réservations.' });
  }
});

// GET /bookings/:id
realEstateBookingRouter.get('/bookings/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const bookingId = req.params.id;
  const callerUid = req.user?.uid;

  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    const snap = await db.collection('real_estate_bookings').doc(bookingId).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    const booking = snap.data() as BookingShort;

    if (booking.tenantId !== callerUid && booking.ownerId !== callerUid && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès refusé. Vous n\'êtes pas autorisé à consulter cette réservation.' });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error('Error fetching booking', { bookingId, callerUid, err: errorMsg });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la réservation.' });
  }
});

// PUT /bookings/:id/status
realEstateBookingRouter.put(
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
realEstateBookingRouter.post('/bookings/:id/cancel', strictLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
});

// POST /visits
realEstateBookingRouter.post(
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

      const propertyData = propSnap.data() as Property;
      const visitId = `VISIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
realEstateBookingRouter.put(
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
