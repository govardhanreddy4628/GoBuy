// import mongoose from "mongoose";
// import addressModel from "../models/addressModal.js";
// import orderModel from "../models/orderModel.js";
// import crypto from "crypto";
// import { NextFunction, Request, Response } from "express";

// export const createOrder = async (req:Request, res:Response) => {

//   const { items, addressId, paymentMethod } = req.body;

//   const address = await addressModel.findById(addressId);

//   if (!address) {
//     return res.status(404).json({ message: "Address not found" });
//   }

//   const orderItems = items.map(item => ({
//     productId: item.productId,
//     name: item.name,
//     price: item.price,
//     quantity: item.quantity,
//     image: item.image,
//   }));

//   const totalAmount = orderItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const order = await orderModel.create({
//     userId: req.user.id,
//     items: orderItems,
//     shippingAddress: {
//       fullName: address.fullName,
//       mobile: address.mobile,
//       houseNumber: address.houseNumber,
//       address_line: address.address_line,
//       city: address.city,
//       state: address.state,
//       pincode: address.pincode,
//       country: address.country,
//     },
//     paymentMethod,
//     totalAmount,
//   });

//   res.status(201).json({
//     success: true,
//     data: order,
//   });
// };


// // ===============================
// // 2. INVENTORY LOCKING SYSTEM
// // ===============================

// export const lockInventory = async (items: IOrderItem[]) => {
//   for (const item of items) {
//     const product = await mongoose.model("Product").findById(item.productId);

//     if (!product || product.stock < item.quantity) {
//       throw new Error(`Insufficient stock for ${item.name}`);
//     }

//     product.stock -= item.quantity;
//     await product.save();
//   }
// };

// // ===============================
// // 3. COUPON ENGINE
// // ===============================

// export const applyCoupon = async (code: string, total: number) => {
//   const coupon = await mongoose.model("Coupon").findOne({ code });

//   if (!coupon) throw new Error("Invalid coupon");

//   if (coupon.type === "percentage") {
//     return (total * coupon.value) / 100;
//   }

//   return coupon.value;
// };

// // ===============================
// // 4. CREATE RAZORPAY ORDER
// // ===============================
// // Create Razorpay order and save local order
// export const createRazorpayOrder  = async (req:Request, res:Response) => {
//   try {
//     const { items, amount } = req.body;
//     if (!items || !amount)
//       return res.status(400).json({ message: "Items and amount required" });

//     // Razorpay expects amount in smallest currency unit
//     const options = {
//         amount: amount*100, // e.g. for ₹100 -> 10000
//         currency: "INR",
//         receipt: `rcpt_${Date.now()}`,
//         payment_capture: 1,   //auto-capture
//     }
//     const rzpOrder = await razorpayInstance.orders.create({ ...options });

//     const order = await orderModel.create({
//       items,
//       amount,
//       currency: "INR",
//       status: "CREATED",
//       payment: { razorpay_order_id: rzpOrder.id },
//     });

//     res.json({ orderId: order._id, razorpayOrder: rzpOrder });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // ===============================
// // 5. CREATE ORDER CONTROLLER
// // ===============================

// export const createOrder = async (req, res) => {
//   try {
//     const { items, address, paymentMethod, coupon } = req.body;

//     let total = items.reduce(
//       (acc, item) => acc + item.price * item.quantity,
//       0
//     );

//     let discount = 0;

//     if (coupon) {
//       discount = await applyCoupon(coupon, total);
//     }

//     const finalAmount = total - discount;

//     await lockInventory(items);

//     let razorpayOrder = null;

//     if (paymentMethod === "razorpay") {
//       razorpayOrder = await createRazorpayOrder(finalAmount);
//     }

//     const order = await OrderModel.create({
//       userId: req.user._id,
//       items,
//       totalAmount: total,
//       discount,
//       finalAmount,
//       address,
//       coupon,

//       payment: {
//         method: paymentMethod,
//         status: "pending",
//         razorpayOrderId: razorpayOrder?.id,
//         amount: finalAmount,
//       },
//     });

//     res.json({ success: true, order, razorpayOrder });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ===============================
// // 6. VERIFY PAYMENT
// // ===============================
// // Verify signature after frontend returns payment details
// export const verifyPayment = async (req:Request, res:Response) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId} = req.body;

//     if (!razorpay_signature || !razorpay_payment_id || !razorpay_order_id)
//       return res.status(400).json({ message: "Missing payment data" });

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const secret = process.env.RAZORPAY_API_SECRET;
//     if (!secret) {
//         return res.status(500).json({ message: "Payment secret not configured" });
//     }
    
//     // compute expected signature
//     const expectedSignature = crypto
//     .createHmac("sha256", secret);
//     .update(body.toString());
//     .digest("hex");

//     const isAuthentic = expectedSignature === razorpay_signature;
//     if (!isAuthentic) {
//       // Signature mismatch
//       await orderModel.findByIdAndUpdate(orderId, {
//         status: "FAILED",
//         $set: {
//           "payment.razorpay_payment_id": razorpay_payment_id,
//           "payment.razorpay_signature": razorpay_signature,
//         },
//       });
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     // Signature valid -> update order
//     const updated = await orderModel.findByIdAndUpdate(
//       orderId,
//       {
//         status: "PAID",
//         $set: {
//           "payment.razorpay_payment_id": razorpay_payment_id,
//           "payment.razorpay_signature": razorpay_signature,
//           "payment.status": "captured",
//         },
//       },
//       { new: true }
//     );

//     res.json({ message: "Payment verified", order: updated });
//     // res.redirect(
//     //   `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
//     // );
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ===============================
// // 7. REFUND AUTOMATION
// // ===============================

// export const processRefund = async (orderId: string) => {
//   const order = await OrderModel.findById(orderId);

//   if (!order) throw new Error("Order not found");

//   order.payment.status = "refunded";
//   order.orderStatus = "returned";

//   await order.save();
// };

// // ===============================
// // 8. RETURN WORKFLOW
// // ===============================

// export const requestReturn = async (req, res) => {
//   const { orderId } = req.body;

//   const order = await OrderModel.findById(orderId);

//   if (!order || order.orderStatus !== "delivered") {
//     return res.status(400).json({ error: "Invalid return request" });
//   }

//   order.orderStatus = "returned";
//   await order.save();

//   await processRefund(orderId);

//   res.json({ success: true });
// };

// // ===============================
// // 9. PAYMENT FAILURE RECOVERY
// // ===============================

// export const retryPayment = async (req, res) => {
//   const { orderId } = req.body;

//   const order = await OrderModel.findById(orderId);

//   if (!order) return res.status(404).json({ error: "Order not found" });

//   const razorpayOrder = await createRazorpayOrder(order.finalAmount);

//   order.payment.razorpayOrderId = razorpayOrder.id;
//   order.payment.status = "pending";

//   await order.save();

//   res.json({ razorpayOrder });
// };

// // ===============================
// // 10. ADMIN ANALYTICS
// // ===============================

// export const getAnalytics = async () => {
//   const totalOrders = await OrderModel.countDocuments();

//   const revenue = await OrderModel.aggregate([
//     { $match: { "payment.status": "paid" } },
//     { $group: { _id: null, total: { $sum: "$finalAmount" } } },
//   ]);

//   return {
//     totalOrders,
//     revenue: revenue[0]?.total || 0,
//   };

