import { Router } from "express";
import { productCatalogRouter } from "./controllers/productCatalog.controller";
import { productStoreRouter } from "./controllers/productStore.controller";
import { productSearchSeoRouter } from "./controllers/productSearchSeo.controller";

const router = Router();

router.use(productCatalogRouter);
router.use(productStoreRouter);
router.use(productSearchSeoRouter);

export default router;
