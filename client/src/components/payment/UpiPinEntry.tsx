import { ChevronLeft, Delete } from "lucide-react";
import { useState } from "react";
import { BankInfo } from "./payment";

interface Props {
  amount?: number;
  onSubmit: () => void;
  onBack: () => void;
  bank: BankInfo;
}

const UpiPinEntry = ({ onSubmit, onBack, bank }: Props) => {
  const [pin, setPin] = useState("");
  const maxLength = 6;

  const handleKey = (key: string) => {
    if (key === "delete") {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < maxLength) {
      setPin((p) => p + key);
    }
  };

  const handleSubmit = () => {
    if (pin.length >= 4) onSubmit();
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      <div className="bg-primary px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6 text-primary-foreground" /></button>
        <span className="text-primary-foreground font-semibold text-base">Enter UPI PIN</span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${bank.color})` }}>
            <span className="text-white font-bold text-xs">{bank.code}</span>
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">{bank.name}</p>
            <p className="text-muted-foreground text-xs">XXXX 4521</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <p className="text-muted-foreground text-sm mb-6">Enter your 6-digit UPI PIN</p>
        <div className="flex gap-3 mb-8">
          {Array.from({ length: maxLength }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${i < pin.length ? "bg-accent border-accent scale-110" : "border-muted-foreground/40 bg-transparent"}`} />
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-1">
          {keys.map((key, i) => (
            <button key={i} onClick={() => key && handleKey(key)} disabled={!key} className={`h-14 rounded-xl flex items-center justify-center transition-all ${key === "" ? "invisible" : "text-foreground text-xl font-medium active:bg-muted/30 hover:bg-muted/20"}`}>
              {key === "delete" ? <Delete className="w-6 h-6" /> : key}
            </button>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={pin.length < 4} className={`w-full mt-4 py-4 rounded-xl font-semibold text-base transition-all ${pin.length >= 4 ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          ✓
        </button>
      </div>
    </div>
  );
};

export default UpiPinEntry;
