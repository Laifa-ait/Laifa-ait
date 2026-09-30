import { Router } from 'express';
import { realEstateSearchRouter } from './realEstateSearch.controller';
import { realEstateDetailsRouter } from './realEstateDetails.controller';
import { realEstateMutationsRouter } from './realEstateMutations.controller';
import { realEstateStatusLifecycleRouter } from './realEstateStatusLifecycle.controller';

export const realEstatePropertyRouter = Router();

// Mount modular sub-controllers
realEstatePropertyRouter.use(realEstateSearchRouter);
realEstatePropertyRouter.use(realEstateDetailsRouter);
realEstatePropertyRouter.use(realEstateMutationsRouter);
realEstatePropertyRouter.use(realEstateStatusLifecycleRouter);

// Re-export DTO serialization services for backward compatibility
export { toPublicPropertyDTO, ALLOWED_LEGAL_PAPERS } from '../services/realEstateDTO';
