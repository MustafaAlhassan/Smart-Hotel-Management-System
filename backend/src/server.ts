import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routers/authRoute";
import roomRouter from "./routers/rooms/roomRoute";
import { requireAuth } from "./middlewares/requireAuth";
import roomTypeRouter from "./routers/rooms/roomTypeRoute";
import guestRouter from "./routers/guestRoute";
import serviceRouter from "./routers/serviceRoute";
import bookingRouter from "./routers/bookingRoute";
import invoiceRouter from "./routers/invoiceRoute";
import dashboardRouter from "./routers/dashboardRoute";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/api/room-types", requireAuth, roomTypeRouter);
app.use("/api/rooms", requireAuth, roomRouter);
app.use("/api/guests", requireAuth, guestRouter);
app.use("/api/services", requireAuth, serviceRouter);
app.use("/api/bookings", requireAuth, bookingRouter);
app.use("/api/invoices", requireAuth, invoiceRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hotel Management System API is running (TypeScript)...");
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB successfully!");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
} else {
  console.error("❌ MONGODB_URI is not defined in .env file!");
}
