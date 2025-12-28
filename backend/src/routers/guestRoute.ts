import express from "express";
import {
  createGuest,
  deleteGuest,
  getAllGuests,
  getSingleGuest,
  updateGuest,
} from "../controllers/guestController";

const guestRouter = express.Router();

guestRouter.post("/", createGuest);
guestRouter.get("/", getAllGuests);
guestRouter.get("/:id", getSingleGuest);
guestRouter.put("/:id", updateGuest);
guestRouter.delete("/:id", deleteGuest);

export default guestRouter;
