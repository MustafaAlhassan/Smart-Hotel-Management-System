import express from "express";
import { getMe } from "../controllers/userController";
import { requireAuth } from "../middlewares/requireAuth";

const userRouter = express.Router();

userRouter.get("/me", requireAuth, getMe);

export default userRouter;