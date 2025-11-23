import express from "express";
import { loginUser } from "../controllers/authController";

const userRouter = express.Router();

userRouter.post("/login", loginUser);

export default userRouter;
