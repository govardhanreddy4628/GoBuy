// server/controllers/paymentController.js

import crypto from "crypto";
import { Request, Response } from "express";
import orderModel from "../models/orderModel.js";


// Optional: webhook handler sample (recommended to verify using webhook secret)
export const razorpayWebhook = async (req:Request, res:Response) => {
  // If you use bodyParser.json(), capture the raw body separately to verify signature with webhook secret.
  // This is a placeholder; real implementation must verify signature using RAZORPAY_WEBHOOK_SECRET.
  res.status(200).json({ ok: true });
};
