import express from "express";
import {
  createService,
  deleteService,
  getAllServices,
  getSingleService,
  updateService,
} from "../controllers/serviceController";

const serviceRouter = express.Router();

serviceRouter.post("/", createService);
serviceRouter.get("/", getAllServices);
serviceRouter.get("/:id", getSingleService);
serviceRouter.put("/:id", updateService);
serviceRouter.delete("/:id", deleteService);

export default serviceRouter;
