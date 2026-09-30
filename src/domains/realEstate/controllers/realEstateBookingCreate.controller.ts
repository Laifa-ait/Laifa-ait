import crypto from 'crypto';
import { Router, Response } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { strictLimiter } from '../../../middlewares/rateLimiters';
import { validateRequest } from '../../../middlewares/validation';
import { BookingCreateSchema } from '../../../schemas/realEstate';
import { StoredProperty, BookingShort } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateBookingCreateRouter = Router();

// POST /bookings
realEstateBookingCreateRouter.post(
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

        const propertyData = propSnap.data() as StoredProperty;

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

        const bookingId = `BOOK-${Date.now()}-${crypto.randomInt(1000, 10000)}`;
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
