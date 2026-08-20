import { Router } from "express";
import { getShippingLocations, calculateShippingRates } from "./controllers/ShippingController";

const router = Router();

router.get("/locations", getShippingLocations);
router.post("/rates", calculateShippingRates);

export default router;
