// server/routes/paymentRoutes.js
import express from 'express';
import { razorpayWebhook } from '../controllers/paymentController.js';
//import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';


const router = express.Router();


// router.post('/create-order', createOrder);
// router.post('/verify-payment', verifyPayment);
router.post('/webhook', razorpayWebhook);


export default router;