import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description?: string;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface IHotel extends Document {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxRate: number;
  currency: string;
  logo?: string;
  discountCodes: IDiscountCode[];
}

const discountCodeSchema = new Schema<IDiscountCode>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true, default: "AMI Hotel" },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    taxRate: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "$" },
    logo: { type: String },
    discountCodes: {
      type: [discountCodeSchema],
      default: [],
      validate: {
        validator: function (codes: IDiscountCode[]) {
          const normalized = codes.map((c) => c.code.toUpperCase());
          return normalized.length === new Set(normalized).size;
        },
        message: "Discount codes must be unique.",
      },
    },
  },
  { timestamps: true },
);

export const HotelModel = mongoose.model<IHotel>("Hotel", hotelSchema);
