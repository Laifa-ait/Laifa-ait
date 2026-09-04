import { Router } from "express";
import sellerRouter from "./seller/seller.routes";
import shopPublicRouter from "./seller/shopPublic.routes";
import buyerRouter from "./buyer/buyer.routes";
import supportRouter from "./support/support.routes";
import settingsRouter from "./home/settings.routes";
import publicHomeRouter from "./home/public.routes";
import adminWorkspaceRouter from "./workspace/controllers/adminWorkspace.controller";
import auth2faRouter from "./auth/auth2fa.routes";
import orderChatRouter from "./messaging/orderChat.routes";
import marketingRouter from "./marketing/marketing.routes";
import notificationRouter from "./notifications/notification.routes";
import publicSponsoredCampaignRouter from "./sponsorship/controllers/publicSponsoredCampaign.controller";
import type { AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// Mount domain sub-routers
router.use(sellerRouter);
router.use(shopPublicRouter);
router.use(buyerRouter);
router.use(supportRouter);
router.use(settingsRouter);
router.use(publicHomeRouter);
router.use(adminWorkspaceRouter);
router.use(auth2faRouter);
router.use(orderChatRouter);
router.use(marketingRouter);
router.use(notificationRouter);
router.use("/api/v1/public/sponsored", publicSponsoredCampaignRouter);

export type { AuthenticatedRequest };
export default router;
