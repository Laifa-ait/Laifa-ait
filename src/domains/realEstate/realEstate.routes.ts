import { Router } from 'express';
import { realEstatePropertyRouter } from './controllers/realEstateProperty.controller';
import { realEstateBookingRouter } from './controllers/realEstateBooking.controller';
import { realEstateProAppRouter } from './controllers/realEstateProApp.controller';

export const realEstateRouter = Router();

realEstateRouter.use(realEstatePropertyRouter);
realEstateRouter.use(realEstateBookingRouter);
realEstateRouter.use(realEstateProAppRouter);
