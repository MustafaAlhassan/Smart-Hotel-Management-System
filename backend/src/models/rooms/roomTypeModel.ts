import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoomType extends Document {
  _id: Types.ObjectId;
  name: string;
  basePrice: number;
  capacity: number;
  description?: string;
  amenities: string[];
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: { type: String, required: true, unique: true },
    basePrice: { type: Number, required: true },
    capacity: { type: Number, required: true },
    description: { type: String },
    amenities: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const RoomTypeModel = mongoose.model<IRoomType>(
  "RoomType",
  roomTypeSchema
);
