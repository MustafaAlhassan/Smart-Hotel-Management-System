import express from "express";
import { loginUser } from "../controllers/authController";

const userRoutes = express.Router();

userRoutes.post("/login", loginUser);

export default userRoutes;
