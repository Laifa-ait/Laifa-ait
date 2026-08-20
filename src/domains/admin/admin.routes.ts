import { Router } from "express";
import adminSellerRouter from "./routes/adminSeller.routes";
import adminProductRouter from "./routes/adminProduct.routes";
import adminFinanceRouter from "./routes/adminFinance.routes";
import adminMarketingRouter from "./routes/adminMarketing.routes";
import adminSystemRouter from "./routes/adminSystem.routes";

const adminRouter = Router();

adminRouter.use(adminSellerRouter);
adminRouter.use(adminProductRouter);
adminRouter.use(adminFinanceRouter);
adminRouter.use(adminMarketingRouter);
adminRouter.use(adminSystemRouter);

export default adminRouter;
