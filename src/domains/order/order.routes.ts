import { Router } from "express";

import orderStatusController from "./controllers/OrderStatusController";
import orderDisputeController from "./controllers/OrderDisputeController";
import orderPlacementController from "./controllers/OrderPlacementController";
import orderTrackingController from "./controllers/OrderTrackingController";
import orderQueryController from "./controllers/OrderQueryController";

const router = Router();

router.use(orderStatusController);
router.use(orderDisputeController);
router.use(orderPlacementController);
router.use(orderTrackingController);
router.use(orderQueryController);

export default router;
