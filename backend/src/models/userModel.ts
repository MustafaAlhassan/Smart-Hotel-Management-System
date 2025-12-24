import mongoose, { Schema, Document, Types } from "mongoose";

export enum UserRole {
  ADMIN = "Admin",
  RECEPTIONIST = "Receptionist",
  MANAGER = "Manager",
  HOUSEKEEPING = "Housekeeping",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.HOUSEKEEPING,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
