import { PHONEPE_CONFIG } from "../config/phonepe.js";
import axios from "axios";
import crypto from "crypto";

export const createPhonePePayment = async (order:any, transactionId:string) => {
  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: order.user.toString(),
    amount: order.totalAmount * 100, // in paise
    redirectUrl: PHONEPE_CONFIG.REDIRECT_URL,
    redirectMode: "REDIRECT",
    callbackUrl: PHONEPE_CONFIG.CALLBACK_URL,
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

  const stringToHash =
    base64Payload + "/pg/v1/pay" + PHONEPE_CONFIG.SALT_KEY;

  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const checksum = sha256 + "###" + PHONEPE_CONFIG.SALT_INDEX;

  try{
  const response = await axios.post(
    `${PHONEPE_CONFIG.BASE_URL}/pg/v1/pay`,
    { request: base64Payload },
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
    }
  );

  return response.data.data.instrumentResponse.redirectInfo.url;
} catch (error: any){
  console.log("PHONEPE ERROR:", error.response?.data || error.message);
    throw error;
}
};