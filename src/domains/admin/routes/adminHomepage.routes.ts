import { Router } from "express";
import adminHomepageSectionsRouter from "./adminHomepageSections.routes";
import adminHomepageVersionsRouter from "./adminHomepageVersions.routes";

const router = Router();

// Modular mounting of Admin Homepage management
router.use(adminHomepageSectionsRouter);
router.use(adminHomepageVersionsRouter);

export default router;
