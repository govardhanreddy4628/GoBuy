import { ShieldCheck } from "lucide-react";

const ProcessingScreen = ({ amount }: { amount: number }) => {
  const formattedAmount = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center gap-3">
        <span className="text-primary-foreground font-semibold text-base">Processing</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Animated loader */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">₹</span>
          </div>
        </div>

        <p className="text-foreground font-semibold text-lg mb-2">Processing Payment</p>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Please wait while we process your payment of ₹{formattedAmount}. This may take a few seconds.
        </p>

        {/* Bouncing dots */}
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent dot-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent dot-2" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent dot-3" />
        </div>

        <p className="text-muted-foreground/60 text-xs mt-8">
          Do not press back or close this screen
        </p>
      </div>

      <div className="px-5 pb-6 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-phonepe-success" />
        <span className="text-muted-foreground text-xs">Secured by PhonePe</span>
      </div>
    </div>
  );
};

export default ProcessingScreen;
