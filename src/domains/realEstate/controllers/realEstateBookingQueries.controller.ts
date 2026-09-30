import { Router, Response, Request } from 'express';
import { db } from '../../../config/firebase-admin';
import { authenticateToken, AuthenticatedRequest } from '../../../middlewares/auth';
import { StoredProperty, BookingShort } from '../../../types/realEstate';
import { safeLogger } from '../../../utils/logger';

export const realEstateBookingQueriesRouter = Router();

// GET /properties/:id/availability
realEstateBookingQueriesRouter.get('/properties/:id/availability', async (req: Request, res: Response) => {
  const propertyId = req.params.id;
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database unavailable.' });
    }

    const propSnap = await db.collection('real_estate_properties').doc(propertyId).get();
    if (!propSnap.exists) {
      return res.status(404).json({ success: false, error: 'Propriété introuvable.' });
    }

    const property = propSnap.data() as StoredProperty;

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

// GET /bookings
realEstateBookingQueriesRouter.get('/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

// GET /my-bookings (Dedicated direct alias for tenants)
realEstateBookingQueriesRouter.get('/my-bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const callerUid = req.user?.uid;
  if (!callerUid) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  try {
    if (!db) {
      return res.status(500).json({ success: false, error: 'Base de données indisponible.' });
    }

    const snap = await db
      .collection('real_estate_bookings')
      .where('tenantId', '==', callerUid)
      .get();

    const bookings = snap.docs.map((doc) => doc.data() as BookingShort);
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: bookings,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    safeLogger.error('Error listing tenant my-bookings', { callerUid, err: errorMsg });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération de vos réservations.' });
  }
});

// GET /bookings/:id
realEstateBookingQueriesRouter.get('/bookings/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
