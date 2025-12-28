import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGuest extends Document {
  _id: Types.ObjectId;
  idNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    idNumber: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export const GuestModel = mongoose.model<IGuest>("Guest", guestSchema);
