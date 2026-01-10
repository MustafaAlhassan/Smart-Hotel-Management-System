import mongoose, { Schema, Document, Types } from "mongoose";

export enum BookingStatus {
  CONFIRMED = "Confirmed",
  CHECKED_IN = "Checked-In",
  CHECKED_OUT = "Checked-Out",
  CANCELLED = "Cancelled",
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  guest: Types.ObjectId;
  room: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    guest: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    adults: {
      type: Number,
      required: true,
      min: [1, "Booking must have at least one adult"],
      max: [10, "The room cannot accommodate more than 10"],
    },
    children: {
      type: Number,
      required: true,
      min: [0, "Children count cannot be negative"],
      max: [10, "The room cannot accommodate more than 10"],
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      required: true,
      default: BookingStatus.CONFIRMED,
      trim: true,
    },
    notes: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

bookingSchema.path("checkOutDate").validate(function (value: Date) {
  if (this.checkInDate) {
    return value > this.checkInDate;
  }
  return true;
}, "Check-out date must be after check-in date.");

export const BookingModel = mongoose.model<IBooking>("Booking", bookingSchema);
