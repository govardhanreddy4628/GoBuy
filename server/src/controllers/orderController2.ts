import mongoose, {Types} from "mongoose";
import addressModel from "../models/addressModal.js";
import orderModel from "../models/orderModel.js";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { razorpayInstance } from "../config/razorpay.js";
import Order from "../models/orderModel.js";

// Define item type
interface OrderItem {
  productId: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items, addressId, paymentMethod } = req.body as {
    items: OrderItemInput[];
    addressId: string;
    paymentMethod: string;
  };

  const address = await addressModel.findById(addressId);

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  const orderItems = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await orderModel.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress: {
      fullName: address.fullName,
      mobile: address.mobile,
      houseNumber: address.houseNumber,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    },
    paymentMethod,
    totalAmount,
  });

  return res.status(201).json({
    success: true,
    data: order,
  });
};


// ===============================
// 2. INVENTORY LOCKING SYSTEM
// ===============================

export const lockInventory = async (items: OrderItem[]) => {
  const Product = mongoose.model("Product");

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    product.stock -= item.quantity;
    await product.save();
  }
};

// ===============================
// 3. COUPON ENGINE
// ===============================

export const applyCoupon = async (code: string, total: number) => {
  const coupon = await mongoose.model("Coupon").findOne({ code });

  if (!coupon) throw new Error("Invalid coupon");

  if (coupon.type === "percentage") {
    return (total * coupon.value) / 100;
  }

  return coupon.value;
};

// ===============================
// 4. CREATE RAZORPAY ORDER
// ===============================
// 🔹 reusable service (IMPORTANT FIX)
export const createRazorpayOrderService = async (amount: number) => {
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    payment_capture: 1,
  };

  return await razorpayInstance.orders.create(options);
};
// Create Razorpay order and save local order
// 🔹 controller
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { items, amount } = req.body as {
      items: any[];
      amount: number;
    };

    if (!items || !amount) {
      return res
        .status(400)
        .json({ message: "Items and amount required" });
    }

    const rzpOrder = await createRazorpayOrderService(amount);

    const order = await orderModel.create({
      items,
      amount,
      currency: "INR",
      status: "CREATED",
      payment: { razorpay_order_id: rzpOrder.id },
    });

    return res.json({ orderId: order._id, razorpayOrder: rzpOrder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 5. CREATE ORDER CONTROLLER
// ===============================

export const createOrder2 = async (req: AuthRequest, res: Response) => {
  try {
    const { items, address, paymentMethod, coupon } = req.body as {
      items: OrderItem[];
      address: any;
      paymentMethod: string;
      coupon?: string;
    };

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let discount = 0;

    if (coupon) {
      discount = await applyCoupon(coupon, total);
    }

    const finalAmount = total - discount;

    await lockInventory(items);

    let razorpayOrder: any = null;

    // ✅ FIX: call SERVICE, not controller
    if (paymentMethod === "razorpay") {
      razorpayOrder = await createRazorpayOrderService(finalAmount);
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount: total,
      discount,
      finalAmount,
      address,
      coupon,
      payment: {
        method: paymentMethod,
        status: "pending",
        razorpayOrderId: razorpayOrder?.id,
        amount: finalAmount,
      },
    });

    return res.json({ success: true, order, razorpayOrder });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// ===============================
// 6. VERIFY PAYMENT
// ===============================
// Verify signature after frontend returns payment details
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      orderId: string;
    };

    if (!razorpay_signature || !razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "Payment secret not configured" });
    }

    // ✅ FIXED: chaining crypto methods correctly
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await Order.findByIdAndUpdate(orderId, {
        status: "FAILED",
        $set: {
          "payment.razorpay_payment_id": razorpay_payment_id,
          "payment.razorpay_signature": razorpay_signature,
        },
      });

      return res.status(400).json({ message: "Invalid signature" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "PAID",
        $set: {
          "payment.razorpay_payment_id": razorpay_payment_id,
          "payment.razorpay_signature": razorpay_signature,
          "payment.status": "captured",
        },
      },
      { new: true }
    );

    // ⚠️ FIX: don't send two responses
    return res.json({ message: "Payment verified", order: updated });

    // ❌ REMOVE this (causes error: headers already sent)
    // res.redirect(...)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 7. REFUND AUTOMATION
// ===============================

export const processRefund = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  order.payment.status = "refunded";
  order.orderStatus = "returned";

  await order.save();
};

// ===============================
// 8. RETURN WORKFLOW
// ===============================

export const requestReturn = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order || order.orderStatus !== "delivered") {
    return res.status(400).json({ error: "Invalid return request" });
  }

  order.orderStatus = "returned";
  await order.save();

  await processRefund(orderId);

  res.json({ success: true });
};

// ===============================
// 9. PAYMENT FAILURE RECOVERY
// ===============================
// 🔹 retry payment
export const retryPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body as { orderId: string };

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ FIX: use service, not controller
    const razorpayOrder = await createRazorpayOrderService(
      order.finalAmount
    );

    order.payment.razorpayOrderId = razorpayOrder.id;
    order.payment.status = "pending";

    await order.save();

    return res.json({ razorpayOrder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 10. ADMIN ANALYTICS
// ===============================

export const getAnalytics = async () => {
  const totalOrders = await Order.countDocuments();

  const revenue = await Order.aggregate([
    { $match: { "payment.status": "paid" } },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);

  return {
    totalOrders,
    revenue: revenue[0]?.total || 0,
  };
};

