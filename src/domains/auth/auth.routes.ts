import { Router } from "express";
import auth2faRouter from "./auth2fa.routes";
import authOnboardingRouter from "./authOnboarding.routes";
import authSyncRouter from "./authSync.routes";
import authUserDataRouter from "./authUserData.routes";
import authGuestConversionRouter from "./authGuestConversion.routes";
import authAdminSessionRouter from "./authAdminSession.routes";

const router = Router();

// Modular mounting of Auth sub-domains
router.use("/2fa", auth2faRouter);
router.use(authOnboardingRouter);
router.use(authSyncRouter);
router.use(authUserDataRouter);
router.use(authGuestConversionRouter);
router.use(authAdminSessionRouter);

export default router;
