import mongoose, { Schema, Document } from "mongoose";

export const PAYMENT_METHODS = [
  "phonepe",
  "razorpay",
  "stripe",
  "cod",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_ATTEMPT_STATUS = [
  "pending",
  "success",
  "failed",
  "cancelled",
] as const;
export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUS)[number];

export interface IPayment extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;

  paymentMethod: PaymentMethod;
  status: PaymentAttemptStatus;
  transactionId?: string;
  gatewayResponse?: any;
  amount: number;
  currency: string;
  attemptNumber: number;

  // razorpayOrderId?: string;
  // razorpayPaymentId?: string;
  // razorpaySignature?: string;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },

    status: {
      type: String,
      enum: PAYMENT_ATTEMPT_STATUS,
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    gatewayResponse: {
      type: Schema.Types.Mixed,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    attemptNumber: {
      type: Number,
      default: 1,
    },

    // razorpayOrderId?: string;
    // razorpayPaymentId?: string;
    // razorpaySignature?: string;
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1, attemptNumber: 1 });

const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
