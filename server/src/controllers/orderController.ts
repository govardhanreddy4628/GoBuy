import { IOrder } from "../models/orderModel.js";
import Order from "../models/orderModel.js";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import productModel from "../models/productModel.js";
import { applyOffer } from "../services/offerService.js";
import { getRevenueStats } from "../services/analyticsService.js";
import addressModel from "../models/addressModal.js";
import Payment from "../models/paymentModel.js";
import { getIO } from "../sockets/index.js";

/* ---------------- ORDER ID GENERATOR ---------------- */
const generateOrderId = (): string => {
  const year = new Date().getFullYear();

  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `ORD-${year}-${randomPart}`;
};

// ✅ CREATE ORDER
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, deliveryAddressId, paymentMethod, offerId, totalAmount } =
      req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Please login" });
    }

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryAddressId) {
      return res.status(400).json({ message: "delivery addressId required" });
    }

    // ✅ Fetch address from DB
    const address = await addressModel.findOne({
      _id: deliveryAddressId,
      userId,
      status: true,
    });

    if (!address) {
      return res.status(400).json({ message: "Invalid address" });
    }

    /* ---------------- STOCK LOCK ---------------- */
    const enrichedItems: any[] = [];

    for (const item of items) {
      const product = await productModel.findOneAndUpdate(
        {
          _id: item.productId,
          quantityInStock: { $gte: item.quantity },
        },
        { $inc: { quantityInStock: -item.quantity } },
        { new: true },
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Stock not available",
        });
      }

      enrichedItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: product.finalPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });
    } 

    /* ---------------- STATUS LOGIC ---------------- */

    let orderStatus: string;
    let paymentStatus: string;

    if (paymentMethod === "cod") {
      // ✅ COD FLOW
      orderStatus = "confirmed";
      paymentStatus = "pending";
    } else {
      // ✅ ONLINE FLOW
      orderStatus = "created"; // wait for payment success
      paymentStatus = "pending";
    }

    /* ---------------- CREATE ORDER ---------------- */
    let order = new Order({
      userId,
      items: enrichedItems,
      // 🔥 Snapshot copy
      shippingAddress: {
        fullName: address.fullName,
        email: address.email,
        mobile: address.mobile,
        houseNumber: address.houseNumber,
        address_line: address.address_line,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country,
      },
      deliveryAddressId: address._id,
      orderStatus,
      paymentStatus,
      deliveryStatus: "pending",
      orderId: generateOrderId(),
      currency: "INR",

       // ✅ Timeline (NEW)
      timeline: [
        {
          status: orderStatus,
          note:
            paymentMethod === "cod"
              ? "Order confirmed (COD)"
              : "Order created, awaiting payment",
          createdAt: new Date(),
        },
      ],

      paymentMethod, // store this (important)
    });

    // Pre-save hook will auto calculate totals
    await order.save();

    /* ---------------- UPDATE PRODUCT ORDER COUNT ---------------- */

    await productModel.bulkWrite(
      enrichedItems.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { orderedCount: item.quantity } },
        },
      })),
    );

    /* ---------------- CREATE PAYMENT RECORD ---------------- */

    await Payment.create({
      orderId: order._id,
      userId,
      paymentMethod,
      status: "pending",
      amount: order.totalAmount,
      currency: order.currency,
      attemptNumber: 1,
    });

    /* ---------------- APPLY OFFER ---------------- */
    if (offerId) {
      order = await applyOffer(order, offerId);
      await order.save();
    }

    /* ---------------- SOCKET EVENT ---------------- */
    getIO().of("/admin").emit("order:new", order);

    const message =
      paymentMethod === "cod"
        ? "Order placed with COD"
        : "Order created Successfully. Awaiting payment";

    return res.status(201).json({
      success: true,
      message,
      order,
      orderId: order._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

// ✅ SIMULATE PAYMENT (🔥 MAIN LOGIC)
export const simulatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body; // success | failed

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = getIO();

    const attemptCount =
      (await Payment.countDocuments({ orderId: order._id })) + 1;

    const payment = await Payment.create({
      orderId: order._id,
      userId: order.userId,
      paymentMethod: "phonepe",
      status: status === "success" ? "success" : "failed",
      transactionId: "TXN-" + Date.now(),
      amount: order.totalAmount,
      currency: order.currency,
      attemptNumber: attemptCount,
    });

    if (status === "success") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.deliveryStatus = "processing";

      io.of("/admin").emit("order:paid", order);
      io.to(order.user.toString()).emit("order:update", order);

      const revenueData = await getRevenueStats();
      io.of("/admin").emit("revenue:update", revenueData);
    } else {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";

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

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment simulation failed" });
  }
};

// ✅ RETRY PAYMENT
export const retryPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    // 🔒 RE-LOCK STOCK
    for (const item of order.items) {
      const updated = await productModel.findOneAndUpdate(
        {
          _id: item.productId,
          quantityInStock: { $gte: item.quantity },
        },
        { $inc: { quantityInStock: -item.quantity } },
        { new: true },
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Stock not available for retry",
        });
      }
    }

    order.paymentStatus = "pending";
    order.orderStatus = "placed";
    await order.save();

    // Create new payment attempt
    const attemptNumber =
      (await Payment.countDocuments({ orderId: order._id })) + 1;

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      paymentMethod: "phonepe",
      status: "pending",
      amount: order.totalAmount,
      currency: order.currency,
      attemptNumber,
    });

    res.json({
      success: true,
      message: "Retry payment initiated",
      orderId: order._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Retry failed" });
  }
};



// ✅ UPDATE DELIVERY STATUS
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user?._id;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Not found" });

  order.deliveryStatus = status;

  if (status === "shipped") {
    order.trackingId = "TRK" + Date.now();
  }

  await order.save();

  const io = getIO();
  io.of("/admin").emit("order:update", order);
  io.to(order.userId.toString()).emit("order:update", order);

  res.json({ success: true, order });
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const requestReturn = async (req: Request, res: Response) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only delivered orders can be returned
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        message: "Return allowed only after delivery",
      });
    }

    // Prevent duplicate return request
    if (order.orderStatus === "return_requested") {
      return res.status(400).json({
        message: "Return already requested",
      });
    }

    // Update status
    order.orderStatus = "return_requested";

    // Add timeline event
    order.timeline.push({
      status: "return_requested",
      note: reason || "Customer requested return",
      updatedBy: userId,
      createdAt: new Date(),
    });

    await order.save();

    // Notify admin panel
    getIO().of("/admin").emit("order:return_requested", order);

    res.json({
      success: true,
      message: "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Return request failed" });
  }
};

export const approveReturn = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "return_requested") {
      return res.status(400).json({
        message: "No return request found",
      });
    }

    order.orderStatus = "returned";

    order.timeline.push({
      status: "returned",
      note: "Admin approved return",
      createdAt: new Date(),
    });

    await order.save();

    getIO().of("/admin").emit("order:return_approved", order);

    res.json({
      success: true,
      message: "Return approved",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Return approval failed" });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Cannot refund unpaid order",
      });
    }

    // Get latest successful payment
    const successfulPayment = await Payment.findOne({
      orderId: order._id,
      status: "success",
    }).sort({ createdAt: -1 });

    if (!successfulPayment) {
      return res.status(400).json({
        message: "No successful payment found",
      });
    }

    if (amount > successfulPayment.amount) {
      return res.status(400).json({
        message: "Refund exceeds paid amount",
      });
    }

    // Create refund payment entry
    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      paymentMethod: successfulPayment.paymentMethod,
      status: "refunded",
      amount,
      currency: order.currency,
      transactionId: "REF-" + Date.now(),
      note: reason,
      attemptNumber: (await Payment.countDocuments({ orderId: order._id })) + 1,
    });

    // Update order status
    if (amount < successfulPayment.amount) {
      order.paymentStatus = "partially_refunded";
    } else {
      order.paymentStatus = "refunded";
      order.orderStatus = "refunded";
    }

    order.timeline.push({
      status: "refunded",
      note: `Refund processed: ₹${amount}`,
      createdAt: new Date(),
    });

    await order.save();

    getIO().of("/admin").emit("order:refunded", order);

    res.json({
      success: true,
      message: "Refund processed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Refund failed" });
  }
};




export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(orderId).lean<IOrder>();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    return res.json({
      success: true,
      data: {
        _id: order._id,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        items: order.items,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, method } = req.body;

    const userId = req.user?._id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "OrderId required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent other users paying someone else's order
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized payment attempt",
      });
    }

    // Prevent duplicate payment
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    const io = getIO();

    const attemptNumber =
      (await Payment.countDocuments({ orderId: order._id })) + 1;

    const payment = await Payment.create({
      orderId: order._id,
      userId,
      paymentMethod: method || "phonepe",
      status: "success",
      transactionId: "TXN-" + Date.now(),
      amount: order.totalAmount,
      currency: order.currency,
      attemptNumber,
    });

    // ================= UPDATE ORDER =================

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.deliveryStatus = "processing";

    order.timeline.push({
      status: "payment_success",
      note: `Payment completed via ${method}`,
      createdAt: new Date(),
    });

    await order.save();

    // ================= SOCKET EVENTS =================

    io.of("/admin").emit("order:paid", order);

    io.to(order.userId.toString()).emit("order:update", order);

    const revenueData = await getRevenueStats();
    io.of("/admin").emit("revenue:update", revenueData);

    return res.json({
      success: true,
      message: "Payment verified successfully",
      payment,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};




export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    const query: any = {};

    // 🔍 Search (orderId / email / name)
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      ];
    }

    // 📌 Status filter
    if (status && status !== "all") {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        $push: {
          timeline: {
            status,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order status updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};


// ✅ UPDATE ORDER STATUS (ADMIN)
// export const updateOrderStatus = async (req: Request, res: Response) => {
//   const { orderId } = req.params;

//   const order = await Order.findById(orderId);
//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   order.deliveryStatus = "processing";
//   order.trackingId = "TRK" + Date.now();

//   await order.save();

//   const io = getIO();

//   io.of("/admin").emit("order:shipped", order);
//   io.to(order.user.toString()).emit("order:update", order);

//   res.json({ success: true, order });
// };