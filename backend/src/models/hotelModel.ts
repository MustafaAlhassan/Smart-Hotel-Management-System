import mongoose, { Schema, Document } from "mongoose";

export interface IHotel extends Document {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxRate: number; 
  currency: string;
  logo?: string;
}

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true, default: "AMI Hotel" },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    taxRate: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "$" },
    logo: { type: String },
  },
  { timestamps: true }
);

export const HotelModel = mongoose.model<IHotel>("Hotel", hotelSchema);