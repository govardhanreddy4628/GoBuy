import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { createOrder,  getMyOrders,  getOrderById,  getOrders,  getOrdersByUser,  updateDeliveryStatus, updateOrderStatus, verifyPayment } from "../controllers/orderController.js";

const orderRouter = express.Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

orderRouter.post("/create", authenticate() , asyncHandler(createOrder));
orderRouter.get("/", getOrders);
orderRouter.patch("/:id/status", asyncHandler(updateOrderStatus));
//orderRouter.post("/phonepe/callback", asyncHandler(phonepeCallback));
orderRouter.patch("/:orderId/delivery", asyncHandler(updateDeliveryStatus));
//orderRouter.post("/:orderId/refund", asyncHandler(initiateRefund));

orderRouter.get("/my-orders", authenticate(), asyncHandler(getMyOrders));
orderRouter.get("/:orderId", authenticate(), asyncHandler(getOrderById));
orderRouter.get("/user/:userId", authenticate(), getOrdersByUser);
orderRouter.post("/verify", authenticate(), asyncHandler(verifyPayment));

export default orderRouter;