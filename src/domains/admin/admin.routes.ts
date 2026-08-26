import { Router } from "express";
import adminSellerRouter from "./routes/adminSeller.routes";
import adminProductRouter from "./routes/adminProduct.routes";
import adminMarketingRouter from "./routes/adminMarketing.routes";
import adminHomepageRouter from "./routes/adminHomepage.routes";
import adminSystemRouter from "./routes/adminSystem.routes";

const adminRouter = Router();

adminRouter.use(adminSellerRouter);
adminRouter.use(adminProductRouter);
adminRouter.use(adminMarketingRouter);
adminRouter.use(adminHomepageRouter);
adminRouter.use(adminSystemRouter);

export default adminRouter;
