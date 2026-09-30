import { Router } from 'express';
import { realEstateBookingQueriesRouter } from './realEstateBookingQueries.controller';
import { realEstateBookingCreateRouter } from './realEstateBookingCreate.controller';
import { realEstateBookingStatusRouter } from './realEstateBookingStatus.controller';
import { realEstateVisitsRouter } from './realEstateVisits.controller';

export const realEstateBookingRouter = Router();

// Modular mounting of Real Estate Booking & Visit operations
realEstateBookingRouter.use(realEstateBookingQueriesRouter);
realEstateBookingRouter.use(realEstateBookingCreateRouter);
realEstateBookingRouter.use(realEstateBookingStatusRouter);
realEstateBookingRouter.use(realEstateVisitsRouter);
