export const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  SALT_KEY: process.env.PHONEPE_SALT_KEY,
  SALT_INDEX: Number(process.env.PHONEPE_SALT_INDEX),
  BASE_URL: "https://api-preprod.phonepe.com/apis/pg-sandbox",
  REDIRECT_URL: "http://localhost:5173/payment-status",
  CALLBACK_URL: "http://localhost:5000/api/v1/order/phonepe/callback",
};
