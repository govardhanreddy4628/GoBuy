import { ShieldCheck, Download } from "lucide-react";
import { BankInfo } from "./payment";


interface Props {
  amount: number;
  merchantName: string;
  orderId?: string;
  onDone: () => void;
  bank: BankInfo;
}

const SuccessScreen = ({ amount, merchantName, orderId, onDone, bank }: Props) => {
  const txnId = orderId || "T" + Date.now().toString().slice(-12);
  const formattedAmount = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full">
      <div className="bg-phonepe-success-bg px-4 py-3 flex items-center gap-3">
        <span className="dark:text-white font-semibold text-base">Payment Successful</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-5">
        <div className="relative w-24 h-24 mt-10 mb-6 animate-slide-up">
          <div className="absolute inset-0 rounded-full bg-phonepe-success/20 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-phonepe-success flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw !text-gray-900" />
            </svg>
          </div>
        </div>

        <p className="text-foreground text-3xl font-bold mb-1 animate-slide-up">₹{formattedAmount}</p>
        <p className="text-phonepe-success font-semibold text-sm mb-6 animate-slide-up">Payment Successful!</p>

        <div className="w-full bg-card rounded-xl p-4 mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground text-xs">To</span><span className="text-foreground text-xs font-medium">{merchantName}</span></div>
            <div className="border-t border-phonepe-divider" />
            <div className="flex justify-between"><span className="text-muted-foreground text-xs">From</span><span className="text-foreground text-xs font-medium">{bank.code} XXXX 4521</span></div>
            <div className="border-t border-phonepe-divider" />
            <div className="flex justify-between"><span className="text-muted-foreground text-xs">Transaction ID</span><span className="text-foreground text-xs font-medium">{txnId}</span></div>
            <div className="border-t border-phonepe-divider" />
            <div className="flex justify-between"><span className="text-muted-foreground text-xs">Date & Time</span><span className="text-foreground text-xs font-medium">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
          </div>
        </div>

        <button className="flex items-center gap-2 text-accent text-sm font-medium mb-6"><Download className="w-4 h-4" />Download Receipt</button>
      </div>

      <div className="px-5 pb-3 flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-phonepe-success" /><span className="text-muted-foreground text-xs">Secured by PhonePe</span></div>
      <div className="px-5 pb-6">
        <button onClick={onDone} className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-base transition-all active:scale-[0.98] hover:brightness-110">Done</button>
      </div>
    </div>
  );
};

export default SuccessScreen;
