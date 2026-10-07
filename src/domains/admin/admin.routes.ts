import { Router } from "express";
import { authenticateToken, authorizeAdmin, require2FA } from "../../middlewares/auth";

import adminSellerRouter from "./routes/adminSeller.routes";
import adminProductRouter from "./routes/adminProduct.routes";
import adminMarketingRouter from "./routes/adminMarketing.routes";
import adminHomepageRouter from "./routes/adminHomepage.routes";
import adminSystemRouter from "./routes/adminSystem.routes";
import adminAIRouter from "./routes/adminAI.routes";
import adminSeedRouter from "./routes/adminSeed.routes";
import adminSponsoredCampaignRouter from "../sponsorship/controllers/adminSponsoredCampaign.controller";

const adminRouter = Router();

// Enforce authentication, 2FA, and admin authorization on all admin sub-routes
adminRouter.use(["/admin", "/tags"], authenticateToken);
adminRouter.use(["/admin", "/tags"], require2FA);
adminRouter.use(["/admin", "/tags"], authorizeAdmin);

adminRouter.use(adminSellerRouter);
adminRouter.use(adminProductRouter);
adminRouter.use(adminMarketingRouter);
adminRouter.use(adminHomepageRouter);
adminRouter.use(adminSystemRouter);
adminRouter.use(adminAIRouter);
adminRouter.use(adminSeedRouter);
adminRouter.use(adminSponsoredCampaignRouter);

export default adminRouter;
