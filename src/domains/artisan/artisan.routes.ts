import { Router } from "express";
import { artisanPublicRouter } from "./artisan.public.routes";
import { artisanUserRouter } from "./artisan.user.routes";
import { artisanAdminRouter } from "./artisan.admin.routes";
import { artisanBroadcastRouter } from "./artisan.broadcast.routes";

export const artisanRouter = Router();

// Mount public endpoints
artisanRouter.use(artisanPublicRouter);

// Mount broadcasts & job announcement endpoints
artisanRouter.use(artisanBroadcastRouter);

// Mount authenticated user & artisan endpoints
artisanRouter.use(artisanUserRouter);

// Mount administrator & moderation endpoints
artisanRouter.use(artisanAdminRouter);

