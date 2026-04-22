import express from "express";
import {
  createService,
  deleteService,
  getAllServices,
  getSingleService,
  updateService,
} from "../controllers/serviceController";
import { UserRole } from "../models/userModel";
import { requireRole } from "../middlewares/requireRole";

const serviceRouter = express.Router();
const writeAccess = [UserRole.ADMIN, UserRole.MANAGER];

const readAccess = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.HOUSEKEEPING,
  UserRole.RECEPTIONIST,
];

serviceRouter.post("/", requireRole(writeAccess), createService);

serviceRouter.get("/", requireRole(readAccess), getAllServices);

serviceRouter.get("/:id", requireRole(readAccess), getSingleService);

serviceRouter.put("/:id", requireRole(writeAccess), updateService);
serviceRouter.delete("/:id", requireRole(writeAccess), deleteService);

export default serviceRouter;
