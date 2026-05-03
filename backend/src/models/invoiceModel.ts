import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInvoiceServiceItem {
  service: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IAppliedDiscount {
  code: string;          
  type: "percentage" | "fixed";
  value: number;           
  discountAmount: number; 
}

export interface IInvoice extends Document {
  booking: Types.ObjectId;
  createdBy: Types.ObjectId;
  usedServices: IInvoiceServiceItem[];
  totalRoomCharge: number;
  totalServiceCharge: number;
  subtotal: number;             
  appliedDiscount?: IAppliedDiscount;
  discountAmount: number;      
  taxableAmount: number;        
  taxAmount: number;
  totalAmountDue: number;        
  paymentStatus: "Paid" | "Pending";
  paymentMethod?: "Cash" | "Credit Card" | "Online" | "Bank Transfer";
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appliedDiscountSchema = new Schema<IAppliedDiscount>(
  {
    code: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    discountAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedServices: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        name: {
          type: String,
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    appliedDiscount: {
      type: appliedDiscountSchema,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxableAmount: {
      type: Number,
      required: true,
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
      enum: ["Paid", "Pending"],
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
  { timestamps: true }
);

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", InvoiceSchema);