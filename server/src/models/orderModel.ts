import mongoose, { Schema, Document, Types } from "mongoose"; //In Mongoose + TypeScript, every model instance you retrieve from the database (e.g., const user = await User.findById(id)) is not just a plain object — it's a Mongoose document that comes with built-in methods like .save(), .populate(), etc.So, Document is the base type for these returned objects.

export const PAYMENT_STATUS = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "refunded",
  "cod_pending",
  "cod_paid",
  "cancelled",
  "partially_refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const ORDER_STATUS = [
  "created",
  "payment_pending",
  "payment_failed",
  "confirmed",
  "packed",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivery_attempted",
  "delivered",
  "cancel_requested",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const DELIVERY_STATUS = [
  "pending",
  "processing",
  "Packed",
  "Ready to Ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivery_attempted",
  "delivered",
  "cancelled",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUS)[number];

// SUB DOCUMENT INTERFACES
type IOrderItem = {
  productId: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

export interface ITimelineEvent {
  status: string;
  note?: string;
  createdAt: Date;
  updatedBy?: Types.ObjectId;
}

export interface IPaymentEvent {  
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  note?: string;
  createdAt: Date;
}
export interface IRefund {
  amount: number;
  reason?: string;
  refundStatus: "none" | "initiated" | "completed" | "failed";
  transactionId?: string;
  createdAt: Date;
}

export interface IShipmentTrackingEvent {
  status: string;
  location?: string;
  description?: string;
  eventTime: Date;
}

export interface IInvoice {
  invoiceNumber: string;
  invoiceUrl?: string;
  issuedAt?: Date;
  gstNumber?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: IOrderItem[];
  totalItems: number;
  totalAmount: number;
  taxAmount: number;
  discount: number;
  subTotalAmount: number;
  shippingCharge: number;
  amountInSmallestUnit: number;
  currency: string;

  paymentStatus: PaymentStatus;

  timeline: ITimelineEvent[];

  invoice?: IInvoice;

  orderStatus: OrderStatus;

  deliveryStatus: DeliveryStatus;

  refunds: IRefund[];

  shippingAddress: {
    fullName: string;
    email: string;
    mobile: string;
    houseNumber?: string;
    address_line: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  deliveryAddressId: mongoose.Schema.Types.ObjectId;

  offer?: {
    offerId: Types.ObjectId;
    type: string;
    discountType: string;
    discountValue: number;
    calculatedDiscount: number;
    description?: string;
  };

  orderId: string;
  shipment: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    webhookRaw?: any;
    trackingHistory: IShipmentTrackingEvent[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true,},
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: String,
        size: String,
      },
    ],
     paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUS,
      default: "created",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: DELIVERY_STATUS,
      default: "pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, required: true },
      houseNumber: String,
      address_line: { type: String, required: true },
      landmark: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },

    deliveryAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    offer: {
      offerId: { type: Schema.Types.ObjectId, ref: "Offer" },
      type: String,
      discountType: String,
      discountValue: Number,
      calculatedDiscount: Number,
      description: String,
    },

    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
      index: true,
    },

    currency: { type: String, default: "INR" },
    totalItems: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }, // you can write this like totalAmount:Number, but object typt allows you to configure additional options like:required,default,min / max, validate, enum (for strings) and more...
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    subTotalAmount: { type: Number, default: 0 },
    amountInSmallestUnit: { type: Number }, // in smallest currency unit (e.g. paise)

    timeline: [
      {
        status: String,
        note: String,
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    invoice: {
      invoiceNumber: String,
      invoiceUrl: String,
      issuedAt: Date,
      gstNumber: String,
    },

    shipment: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
      webhookRaw: Schema.Types.Mixed,
      trackingHistory: [
        {
          status: String,
          location: String,
          description: String,
          eventTime: Date,
        },
      ],
    },

    refunds: [
      {
        amount: Number,
        reason: String,
         refundStatus: {
          type: String,
          enum: ["none", "initiated", "completed", "failed"],
          default: "none",
        },
        transactionId: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// PRE-SAVE AUTO CALCULATION
orderSchema.pre("save", function (next) {
  const order = this as IOrder;

  // Safety: ensure items exist
  if (!order.items || order.items.length === 0) {
    order.subTotalAmount = 0;
    order.totalItems = 0;
  } else {
    // 1️⃣ Calculate subtotal
    order.subTotalAmount = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 2️⃣ Calculate total items
    order.totalItems = order.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
  }

  // 3️⃣ Ensure discount is valid
  const safeDiscount = Math.min(order.discount || 0, order.subTotalAmount);

  order.discount = safeDiscount;

  // 4️⃣ Calculate total
  order.totalAmount =
    order.subTotalAmount -
    safeDiscount +
    (order.shippingCharge || 0) +
    (order.taxAmount || 0);

  // 5️⃣ Prevent negative totals
  if (order.totalAmount < 0) {
    order.totalAmount = 0;
  }

  // 6️⃣ Convert to smallest currency unit
  order.amountInSmallestUnit = Math.round(
    order.totalAmount * 100
  );

  next();
});

orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
//orderSchema.index({ "payment.razorpayOrderId": 1 });

const virtual = orderSchema.virtual("id").get(function () {
  return this._id;
});
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
