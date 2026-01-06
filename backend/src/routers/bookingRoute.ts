import express from "express";
import { createBooking, deleteBooking, getAllBooking, getSingleBooking, updateBooking } from "../controllers/bookingController";

const bookingRouter = express.Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/", getAllBooking);
bookingRouter.get("/:id", getSingleBooking);
bookingRouter.put("/:id", updateBooking);
bookingRouter.delete("/:id", deleteBooking);

export default bookingRouter;
