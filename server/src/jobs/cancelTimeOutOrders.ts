import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import cron from "node-cron";
import mongoose from "mongoose";
import { getIO } from "../sockets/index.js";

export const cancelExpiredOrders = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expiredOrders = await Order.find({
      paymentStatus: "pending",
      expiresAt: { $lt: new Date() },
    }).session(session);

    const io = getIO();

    for (const order of expiredOrders) {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";

      // 🔁 Restore stock in bulk-safe way
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      await order.save({ session });

      // 🔥 SOCKET EVENTS
      io.of("/admin").emit("order:cancelled", order);
      io.to(order.user.toString()).emit("order:update", order);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
  }
};


cron.schedule("*/5 * * * *", cancelExpiredOrders); // every 5 mins