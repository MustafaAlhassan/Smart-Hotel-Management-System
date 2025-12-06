import mongoose, { Schema, Document, Types } from "mongoose";

export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  CLEANING = "Cleaning",
}

export interface IRoom extends Document {
  _id: Types.ObjectId;
  roomNumber: number;
  roomType: Types.ObjectId;
  status: RoomStatus;
  floor: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: Number, required: true, unique: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    status: { type: String, enum: Object.values(RoomStatus), required: true, default: RoomStatus.AVAILABLE },
    floor: { type: Number, required: true },
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<IRoom>("Room", roomSchema);
