import { ChevronLeft, ShieldCheck } from "lucide-react";
import { BankInfo, GatewayMethod } from "./payment";

interface Props {
  amount: number;
  merchantName: string;
  onProceed: () => void;
  onBack: () => void;
  bank: BankInfo;
  method: GatewayMethod;
}

const PaymentSummary = ({ amount, merchantName, onProceed, onBack, bank, method }: Props) => {
  const methodLabel = method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking";
  const formattedAmount = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      <div className="bg-primary px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}>
          <ChevronLeft className="w-6 h-6 text-primary-foreground" />
        </button>
        <span className="text-primary-foreground font-semibold text-base">Payment</span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">{merchantName.charAt(0)}</div>
          <div>
            <p className="text-foreground font-semibold text-sm">{merchantName}</p>
            <p className="text-muted-foreground text-xs">merchant@ybl</p>
          </div>
        </div>
        <div className="border-t border-phonepe-divider" />
      </div>

      <div className="px-5 pb-5">
        <p className="text-muted-foreground text-xs mb-1">PAYING</p>
        <p className="text-foreground text-4xl font-bold">₹{formattedAmount}</p>
      </div>

      <div className="px-5 pb-2">
        <p className="text-muted-foreground text-xs mb-1">PAYMENT METHOD</p>
        <p className="text-foreground text-sm font-medium">{methodLabel}</p>
      </div>

      <div className="px-5 pb-4">
        <p className="text-muted-foreground text-xs mb-3">PAY FROM</p>
        <div className="bg-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${bank.color})` }}>
              <span className="text-primary-foreground font-bold text-xs">{bank.code}</span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">{bank.name}</p>
              <p className="text-muted-foreground text-xs">XXXX 4521 • Savings</p>
            </div>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-accent bg-accent flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="px-5 pb-3 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-phonepe-success" />
        <span className="text-muted-foreground text-xs">Secured by PhonePe</span>
      </div>

      <div className="px-5 pb-6">
        <button onClick={onProceed} className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-base transition-all active:scale-[0.98] hover:brightness-110">
          PAY ₹{formattedAmount}
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;
