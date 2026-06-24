import axios from "axios";
import { useMemo } from "react";

// ✅ Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ✅ Types
type CartItem = {
  id: string;
  price: number;
  quantity: number;
};

type CheckoutProps = {
  cartItems: CartItem[];
};

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// ✅ API helpers with types
const createOrderOnServer = (payload: {
  items: CartItem[];
  amount: number;
}) => API.post("/payments/create-order", payload);

const verifyPaymentOnServer = (payload: any) =>
  API.post("/payments/verify-payment", payload);

// ✅ Load Razorpay SDK
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function Checkout({ cartItems }: CheckoutProps) {
  // ✅ Calculate total safely
  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const handlePay = async (amount: number) => {
    try {
      // ✅ Fixed URL
      const { data: keyResp } = await axios.get(
        "http://localhost:4000/api/getkey"
      );

      const { data: orderResp } = await axios.post(
        "http://localhost:4000/api/checkout",
        { amount }
      );

      const key = keyResp.key;
      const order = orderResp.order;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      // ✅ Create order in your system
      const createResp = await createOrderOnServer({
        items: cartItems,
        amount,
      });

      const orderId = createResp.data.orderId;

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Go Store",
        description: "Go Store Test Transaction",
        order_id: order.id,

        handler: async function (response: any) {
          try {
            const verifyResp = await verifyPaymentOnServer({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });

            alert("Payment successful and verified");
            console.log("Order updated:", verifyResp.data.order);
          } catch (err) {
            console.error("Verification error", err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "govardhan",
          email: "govardhan4628@gmail.com",
          contact: "9999999999",
        },

        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed", response.error);
        alert("Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment init error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h3>Checkout</h3>

      {/* ✅ Fixed totalAmount */}
      <div>Total: ₹{totalAmount.toFixed(2)}</div>

      {/* ✅ Fixed amount */}
      <button onClick={() => handlePay(totalAmount)}>
        Pay with Razorpay
      </button>
    </div>
  );
}