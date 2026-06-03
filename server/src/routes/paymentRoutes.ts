// server/routes/paymentRoutes.js
import express from 'express';
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from '../controllers/paymentController.js';


const router = express.Router();


// router.post('/create-order', createOrder);
// router.post('/verify-payment', verifyPayment);
router.post('/webhook', razorpayWebhook);


export default router;