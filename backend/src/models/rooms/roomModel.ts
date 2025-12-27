import mongoose, { Schema, Document, Types } from "mongoose";

export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  CLEANING = "Cleaning",
}

export interface IRoom extends Document {
  _id: Types.ObjectId;
  roomNumber: string;
  roomType: Types.ObjectId;
  status: RoomStatus;
  floor: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomType: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      required: true,
      default: RoomStatus.AVAILABLE,
    },
    floor: {
      type: Number,
      required: true,
      min: [-5, "Floor cannot be less than minus 5"],
      max: [500, "Floor cannot accommodate more than 500"],
    },
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<IRoom>("Room", roomSchema);
