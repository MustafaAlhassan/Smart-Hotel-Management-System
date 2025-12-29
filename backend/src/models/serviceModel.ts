import mongoose, { Schema, Document, Types } from "mongoose";

export enum ServiceCategory {
  FOOD_BEVERAGE = "Food & Beverage",
  LAUNDRY = "Laundry",
  SPA = "Spa & Wellness",
  TRANSPORTATION = "Transportation",
  OTHER = "Other",
}

export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  price: number;
  isTaxable: boolean;
  category: ServiceCategory;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    price: {
      type: Number,
      required: true,
      min: [0, "price cannot be less than zero"],
    },
    isTaxable: { type: Boolean, required: true, default: false },
    category: {
      type: String,
      enum: Object.values(ServiceCategory),
      required: true,
      default: ServiceCategory.OTHER,
    },
    description: { type: String, trim: true, required: false },
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.model<IService>("Service", serviceSchema);
