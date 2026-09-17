import { Router } from "express";
import { userDocumentsRouter } from "./userDocuments.controller";

export const domainUserDocumentsRouter = Router();
domainUserDocumentsRouter.use(userDocumentsRouter);
