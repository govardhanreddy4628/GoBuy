import Order from "../models/orderModel.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { PHONEPE_CONFIG } from "../config/phonepe.js";
import { createPhonePePayment } from "../utils/createPonepePayment.js";
import productModel from "../models/productModel.js";
import { getRevenueStats } from "../services/analyticsService.js";
import { getIO } from "../sockets/index.js";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingDetails, paymentMethod, totalAmount } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Please login" });
    }

    // 🔒 STEP 1: ATOMIC STOCK LOCK (FIXED)
    for (const item of items) {
      const updated = await productModel.findOneAndUpdate(
        {
          _id: item.productId,
          quantityInStock: { $gte: item.quantity },
        },
        {
          $inc: { quantityInStock: -item.quantity },
        },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Stock not available",
        });
      }
    }

    const order = await Order.create({
      user: userId,
      items,
      shippingDetails,
      paymentMethod,
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "confirmed",
      deliveryStatus: "pending",
    });

    // 🔥 Emit new order (admin dashboard)
    getIO().of("/admin").emit("order:new", order);

    // ✅ COD FLOW
    if (paymentMethod === "cod") {
      return res.json({
        success: true,
        message: "Order placed with COD",
        order,
      });
    }

    // ✅ PHONEPE FLOW
    const transactionId = uuidv4();

    // Save transactionId
    order.transactionId = transactionId;

    const paymentUrl = await createPhonePePayment(order, transactionId);

    await order.save();

    return res.json({
      success: true,
      paymentUrl,
      orderId: order._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

export const verifyPhonePePayment = async (transactionId: string) => {
  const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`;

  const stringToHash = endpoint + PHONEPE_CONFIG.SALT_KEY;

  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");

  const checksum = sha256 + "###" + PHONEPE_CONFIG.SALT_INDEX;

  const res = await axios.get(`${PHONEPE_CONFIG.BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": PHONEPE_CONFIG.MERCHANT_ID,
    },
  });

  return res.data;
};

export const phonepeCallback = async (req: Request, res: Response) => {
  try {
    if (!validatePhonePeSignature(req)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { response } = req.body;

    const decoded = JSON.parse(
      Buffer.from(response, "base64").toString("utf-8"),
    );

    const { merchantTransactionId } = decoded;

    const order = await Order.findOne({
      transactionId: merchantTransactionId,
    });

    if (!order) return res.sendStatus(404);

    // 🔐 VERIFY FROM PHONEPE SERVER
    const verification = await verifyPhonePePayment(merchantTransactionId);

    if (verification.data.responseCode === "SUCCESS") {
      order.paymentStatus = "paid";
      order.deliveryStatus = "processing";

      // 🔥 emit updates
      const io = getIO();

      io.of("/admin").emit("order:paid", order);
      io.to(order.user.toString()).emit("order:update", order);

      // 🔥 analytics update
      const revenueData = await getRevenueStats();
      io.of("/admin").emit("revenue:update", revenueData);
    } else {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";

      const io = getIO();

      // 🔥 EMIT FAILURE EVENT (THIS IS WHAT YOU ASKED)
      io.of("/admin").emit("order:cancelled", order);

      // 🔁 RESTORE STOCK
      for (const item of order.items) {
        const product = await productModel.findById(item.productId);
        if (product) {
          product.quantityInStock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export const validatePhonePeSignature = (req: Request) => {
  const receivedChecksum = req.headers["x-verify"];

  const payload = JSON.stringify(req.body);

  const expectedHash = crypto
    .createHash("sha256")
    .update(payload + PHONEPE_CONFIG.SALT_KEY)
    .digest("hex");

  const expectedChecksum = expectedHash + "###" + PHONEPE_CONFIG.SALT_INDEX;

  return receivedChecksum === expectedChecksum;
};

export const retryPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    // 🔒 STEP 1: RE-LOCK STOCK (IMPORTANT)
    for (const item of order.items) {
      const updated = await productModel.findOneAndUpdate(
        {
          _id: item.productId,
          quantityInStock: { $gte: item.quantity },
        },
        {
          $inc: { quantityInStock: -item.quantity },
        },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Stock not available for retry",
        });
      }
    }

    // create new transactionId
    const newTransactionId = uuidv4();
    order.transactionId = newTransactionId;
    order.paymentStatus = "pending";
    await order.save();

    // reuse PhonePe create logic
    const paymentUrl = await createPhonePePayment(order, newTransactionId);

    res.json({ success: true, paymentUrl });
  } catch (err) {
    res.status(500).json({ message: "Retry failed" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // ✅ Update delivery status
  order.deliveryStatus = "processing";
  order.trackingId = "TRK" + Date.now();

  await order.save();

  // ✅ Emit real-time event
  const io = getIO();

  // 🔥 Admin dashboard update
  io.of("/admin").emit("order:shipped", order);

  // 🔥 Optional: notify specific user
  io.to(order.user.toString()).emit("order:update", order);

  res.json({ success: true, order });
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Not found" });

  order.deliveryStatus = status;

  if (status === "shipped") {
    order.trackingId = "TRK" + Date.now();
  }

  await order.save();

  const io = getIO();

  io.of("/admin").emit("order:update", order);
  io.to(order.user.toString()).emit("order:tracking", order);

  res.json({ success: true, order });
};

export const initiateRefund = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus !== "paid")
      return res.status(400).json({ message: "Not eligible" });

    const refundTransactionId = "REF" + Date.now();

    const payload = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: refundTransactionId,
      originalTransactionId: order.transactionId,
      amount: order.totalAmount * 100,
      callbackUrl: PHONEPE_CONFIG.CALLBACK_URL,
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64",
    );

    const stringToHash =
      base64Payload + "/pg/v1/refund" + PHONEPE_CONFIG.SALT_KEY;

    const checksum =
      crypto.createHash("sha256").update(stringToHash).digest("hex") +
      "###" +
      PHONEPE_CONFIG.SALT_INDEX;

    await axios.post(
      `${PHONEPE_CONFIG.BASE_URL}/pg/v1/refund`,
      { request: base64Payload },
      {
        headers: {
          "X-VERIFY": checksum,
        },
      },
    );

    order.refundStatus = "initiated";
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Refund failed" });
  }
};


// controllers/analyticsController.ts
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const formatted = data.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    revenue: item.revenue,
  }));

  res.json(formatted);
};

export const getPaymentMethodDistribution = async (
  req: Request,
  res: Response,
) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$paymentMethod",
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const formatted = data.map((item) => ({
    name: item._id,
    value: item.total,
  }));

  res.json(formatted);
};

export const getHourlySales = async (req: Request, res: Response) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
};

export const getRevenuePrediction = async (req: Request, res: Response) => {
  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const values = data.map((d, i) => ({
    x: i,
    y: d.revenue,
  }));

  // simple linear regression
  const n = values.length;
  const sumX = values.reduce((a, v) => a + v.x, 0);
  const sumY = values.reduce((a, v) => a + v.y, 0);
  const sumXY = values.reduce((a, v) => a + v.x * v.y, 0);
  const sumXX = values.reduce((a, v) => a + v.x * v.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // predict next 7 days
  const predictions = [];
  for (let i = n; i < n + 7; i++) {
    predictions.push({
      day: i,
      predictedRevenue: slope * i + intercept,
    });
  }

  res.json(predictions);
};

// GET /api/admin/sales-heatmap
export const getHeatmap = async (req: Request, res: Response) => {
  const data = await Order.aggregate([
    {
      $match: { paymentStatus: "paid" },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
};

// GET /api/admin/revenue-history
export const revenueHistory = async (req: Request, res: Response) => {
  const data = await Order.aggregate([
    {
      $match: { paymentStatus: "paid" },
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  res.json(data);
};

// 🤖 AI Prediction
// export const getPrediction = async (req, res) => {
//   const data = await Order.find({ paymentStatus: "paid" })
//     .sort({ createdAt: 1 });

//   const revenues = data.map((o, i) => ({ x: i, y: o.totalAmount }));

//   const n = revenues.length;
//   const sumX = revenues.reduce((a, v) => a + v.x, 0);
//   const sumY = revenues.reduce((a, v) => a + v.y, 0);
//   const sumXY = revenues.reduce((a, v) => a + v.x * v.y, 0);
//   const sumXX = revenues.reduce((a, v) => a + v.x * v.x, 0);

//   const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
//   const intercept = (sumY - slope * sumX) / n;

//   const predictions = Array.from({ length: 7 }).map((_, i) => ({
//     day: i,
//     predicted: slope * (n + i) + intercept,
//   }));

//   res.json(predictions);
// };
