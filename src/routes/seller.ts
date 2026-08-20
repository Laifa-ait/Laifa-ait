import { Router } from "express";
import sellerProductRouter from "../domains/seller/controllers/SellerProductController";
import sellerProductLifecycleRouter from "../domains/seller/controllers/SellerProductLifecycleController";
import sellerAnalyticsRouter from "../domains/seller/controllers/SellerAnalyticsController";
import sellerProfileRouter from "../domains/seller/controllers/SellerProfileController";
import sellerReviewRouter from "../domains/seller/controllers/SellerReviewController";
import sellerSponsorshipRouter from "../domains/seller/controllers/SellerSponsorshipController";
import sellerOrderRouter from "../domains/seller/controllers/SellerOrderController";

const router = Router();

// Mount modular sub-controllers for Seller Domain
router.use(sellerProductRouter);
router.use(sellerProductLifecycleRouter);
router.use(sellerAnalyticsRouter);
router.use(sellerProfileRouter);
router.use(sellerReviewRouter);
router.use(sellerSponsorshipRouter);
router.use(sellerOrderRouter);

export default router;
