import { Router } from 'express';
import { realEstateProOwnerRouter } from './realEstateProOwner.controller';
import { realEstateProApplicationRouter } from './realEstateProApplication.controller';
import { realEstateProAdminRouter } from './realEstateProAdmin.controller';

export const realEstateProAppRouter = Router();

realEstateProAppRouter.use(realEstateProOwnerRouter);
realEstateProAppRouter.use(realEstateProApplicationRouter);
realEstateProAppRouter.use(realEstateProAdminRouter);
