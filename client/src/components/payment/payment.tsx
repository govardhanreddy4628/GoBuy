import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhonepeGateway from "./PhonepeGateway";
import PaymentSummary from "./PaymentSummary";
import UpiPinEntry from "./UpiPinEntry";
import OtpEntry from "./OtpEntry";
import ProcessingScreen from "./ProcessingScreen";
import SuccessScreen from "./SuccessScreen";
import api from "../../api/api_utility";

export type PaymentStep =
  | "gateway"
  | "summary"
  | "pin"
  | "otp"
  | "processing"
  | "success";

export type GatewayMethod = "upi" | "card" | "netbanking";

export interface BankInfo {
  name: string;
  code: string;
  color: string;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { amount: initialAmount, orderId } = location.state || {};

  const [amount, setAmount] = useState<number>(initialAmount || 0);
  const merchantName = "GoBuy Store";

  const [step, setStep] = useState<PaymentStep>("gateway");

  const [selectedMethod, setSelectedMethod] =
    useState<GatewayMethod>("upi");

  const [selectedBank, setSelectedBank] = useState<BankInfo>({
    name: "State Bank of India",
    code: "SBI",
    color: "220 80% 45%",
  });

  // ================= VALIDATE ORDER =================
  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const validateOrder = async () => {
      try {
        const res = await api.get(`/api/v1/order/${orderId}`);

        const order = res.data?.data;

        if (!order) {
          navigate("/");
          return;
        }

        setAmount(order.totalAmount);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    validateOrder();
  }, [orderId, navigate]);

  // ================= GATEWAY =================
  const handleGatewayProceed = (
    method: GatewayMethod,
    bank?: BankInfo
  ) => {
    setSelectedMethod(method);
    if (bank) setSelectedBank(bank);
    setStep("summary");
  };

  const handleSummaryProceed = () => {
    if (selectedMethod === "upi") {
      setStep("pin");
    } else {
      setStep("otp");
    }
  };

  // ================= VERIFY PAYMENT =================
  const handleVerify = async () => {
    setStep("processing");

    try {
      // await api.post("/api/v1/payment/verify", {
      //   orderId,
      //   method: selectedMethod,
      // });

      setTimeout(() => {
        setStep("success");
      }, 2000);
    } catch (error) {
      console.error(error);
      navigate("/");
    }
  };

  return (
    <div className="flex h-auto items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
  <div className="w-full max-w-[420px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {step === "gateway" && (
          <PhonepeGateway
            amount={amount}
            merchantName={merchantName}
            onProceedToPin={handleGatewayProceed}
          />
        )}

        {step === "summary" && (
          <PaymentSummary
            amount={amount}
            merchantName={merchantName}
            onProceed={handleSummaryProceed}
            onBack={() => setStep("gateway")}
            bank={selectedBank}
            method={selectedMethod}
          />
        )}

        {step === "pin" && (
          <UpiPinEntry
            amount={amount}
            onSubmit={handleVerify}
            onBack={() => setStep("summary")}
            bank={selectedBank}
          />
        )}

        {step === "otp" && (
          <OtpEntry
            onSubmit={handleVerify}
            onBack={() => setStep("summary")}
            method={selectedMethod}
          />
        )}

        {step === "processing" && <ProcessingScreen amount={amount}/>}

        {step === "success" && (
          <SuccessScreen
            amount={amount}
            merchantName={merchantName}
            orderId={orderId}
            onDone={() => navigate("/orders")}
            bank={selectedBank}
          />
        )}

      </div>
    </div>
  );
};

export default Payment;