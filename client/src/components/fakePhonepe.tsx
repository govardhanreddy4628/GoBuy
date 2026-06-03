import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";

interface Props {
  value: string;
}

const QRCodeDisplay = ({ value }: Props) => {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value)
      .then((url) => setQr(url))
      .catch((err) => console.error(err));
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-3">
      {qr ? (
        <img
          src={qr}
          alt="QR Code"
          className="w-48 h-48 rounded-lg border"
        />
      ) : (
        <p>Generating QR...</p>
      )}

      <p className="text-sm text-gray-500">
        Scan using PhonePe / GPay / Paytm
      </p>
    </div>
  );
};


export default function PhonePeClone() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<
    "home" | "upi" | "card" | "bank" | "otp" | "processing" | "success" | "failed"
  >("home");

  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState("");
  const [otp, setOtp] = useState("");
  const [txId, setTxId] = useState("");

  const amount = 499;

  const generateTxId = () =>
    "TXN" + Math.random().toString(36).substring(2, 12).toUpperCase();

  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3");
    audio.play();
  };

  const completePayment = async () => {
    const id = generateTxId();
    setTxId(id);

    await axios.post(`/api/payment/verify/${orderId}`, {
      status: "success",
      transactionId: id,
    });

    playSuccessSound();
    setStep("success");

    setTimeout(() => navigate("/order-success"), 2000);
  };

  useEffect(() => {
    if (step === "processing") {
      const timer = setTimeout(() => completePayment(), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ---------------- SCREENS ----------------

  // ✅ SUCCESS
  if (step === "success") {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-white">
        <div className="text-green-500 text-7xl mb-4 animate-bounce">✔</div>
        <h2 className="text-2xl font-bold">Payment Successful</h2>
        <p className="text-gray-500 mt-2">Txn ID: {txId}</p>
      </div>
    );
  }

  // ⏳ PROCESSING
  if (step === "processing") {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-purple-600 text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mb-4"></div>
        <h2 className="text-xl font-semibold">Processing Payment</h2>
        <p className="opacity-80">Please wait...</p>
      </div>
    );
  }

  // 🔐 OTP
  if (step === "otp") {
    return (
      <div className="h-screen bg-purple-600 flex flex-col justify-center items-center text-white">
        <h2 className="text-xl mb-4">Enter OTP</h2>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="p-3 rounded text-black mb-4 text-center tracking-widest"
          maxLength={6}
        />

        <button
          onClick={() => setStep("processing")}
          className="bg-white text-black px-6 py-2 rounded-lg"
        >
          Verify
        </button>
      </div>
    );
  }

  // 🏦 BANK
  if (step === "bank") {
    const banks = ["State Bank of India", "HDFC Bank", "ICICI Bank"];

    return (
      <div className="h-screen bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Select Bank</h2>

        {banks.map((b) => (
          <div
            key={b}
            onClick={() => setStep("otp")}
            className="p-4 border rounded-xl mb-3 cursor-pointer hover:bg-gray-100"
          >
            {b}
          </div>
        ))}
      </div>
    );
  }

  // 💳 CARD
  if (step === "card") {
    return (
      <div className="h-screen bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Enter Card Details</h2>

        <input placeholder="Card Number" className="input" />
        <div className="flex gap-2 mt-2">
          <input placeholder="MM/YY" className="input w-1/2" />
          <input placeholder="CVV" className="input w-1/2" />
        </div>

        <button
          onClick={() => setStep("bank")}
          className="btn-primary mt-4"
        >
          Pay ₹{amount}
        </button>
      </div>
    );
  }

  // 🔵 UPI
  const upiLink = `upi://pay?pa=merchant@upi&pn=GoStore&am=${amount}&tn=Order-${orderId}`;
  if (step === "upi") {
    return (
      <div className="h-screen bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Pay via UPI</h2>

        <div className="flex justify-center mb-4">
          <QRCodeDisplay value={upiLink} />
        </div>

        <input
          placeholder="Enter UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="input"
        />

        <button
          onClick={() => setStep("bank")}
          className="btn-primary mt-4"
        >
          Pay ₹{amount}
        </button>
      </div>
    );
  }

  // 🏠 HOME (MAIN PHONEPE SCREEN)
  return (
    <div className="h-screen bg-white">

      {/* HEADER */}
      <div className="bg-purple-700 text-white p-4 text-center text-lg font-bold">
        PhonePe
      </div>

      {/* AMOUNT */}
      <div className="text-center mt-6">
        <p className="text-gray-500">Paying</p>
        <h1 className="text-3xl font-bold">₹{amount}</h1>
      </div>

      {/* METHODS */}
      <div className="p-4 mt-6 space-y-3">

        <div
          onClick={() => setStep("upi")}
          className="method"
        >
          UPI
        </div>

        <div
          onClick={() => setStep("card")}
          className="method"
        >
          Debit / Credit Card
        </div>

        <div
          onClick={() => setStep("bank")}
          className="method"
        >
          Net Banking
        </div>
      </div>
    </div>
  );
}