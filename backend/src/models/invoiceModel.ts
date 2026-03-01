import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInvoiceServiceItem {
  service: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IInvoice extends Document {
  booking: Types.ObjectId;
  usedServices: IInvoiceServiceItem[];
  totalRoomCharge: number;
  totalServiceCharge: number;
  taxAmount: number;
  totalAmountDue: number;
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
  paymentMethod?: "Cash" | "Credit Card" | "Online" | "Bank Transfer";
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    usedServices: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    totalRoomCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    totalServiceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Partially Paid"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Online", "Bank Transfer"],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
