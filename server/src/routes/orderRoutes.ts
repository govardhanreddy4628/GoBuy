import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { createOrder,  getMyOrders,  getOrderById,  getOrders,  updateDeliveryStatus, updateOrderStatus, verifyPayment } from "../controllers/orderController.js";

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

orderRouter.get("/:orderId", authenticate(), asyncHandler(getOrderById));
orderRouter.post("/verify", authenticate(), asyncHandler(verifyPayment));
orderRouter.get("/my-orders", authenticate(), asyncHandler(getMyOrders));

export default orderRouter;