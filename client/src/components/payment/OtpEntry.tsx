import { ChevronLeft, Delete, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { GatewayMethod } from "./payment";

interface Props {
    onSubmit: () => void;
    onBack: () => void;
    method: GatewayMethod;
}

const OtpEntry = ({ onSubmit, onBack, method }: Props) => {
    const [otp, setOtp] = useState("");
    const maxLength = 6;

    const handleKey = (key: string) => {
        if (key === "delete") {
            setOtp((p) => p.slice(0, -1));
        } else if (otp.length < maxLength) {
            setOtp((p) => p + key);
        }
    };

    const handleSubmit = () => {
        if (otp.length >= 4) onSubmit();
    };

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];
    const title = method === "card" ? "Card Verification" : "Bank Verification";
    const subtitle = method === "card"
        ? "Enter the OTP sent to your registered mobile number"
        : "Enter the OTP sent by your bank";

    return (
        <div className="flex flex-col h-full">
            <div className="bg-primary px-4 py-3 flex items-center gap-3">
                <button onClick={onBack}><ChevronLeft className="w-6 h-6 text-primary-foreground" /></button>
                <span className="text-primary-foreground font-semibold text-base">{title}</span>
            </div>

            <div className="px-5 pt-6 pb-4">
                <div className="bg-card rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-phonepe-success" />
                    <p className="text-muted-foreground text-xs">{subtitle}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-5">
                <p className="text-muted-foreground text-sm mb-6">Enter 6-digit OTP</p>
                <div className="flex gap-3 mb-4">
                    {Array.from({ length: maxLength }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-foreground text-lg font-semibold transition-all duration-200 ${i < otp.length
                                ? "border-accent bg-accent/10"
                                : i === otp.length
                                    ? "border-accent"
                                    : "border-muted-foreground/30"
                                }`}
                        >
                            {i < otp.length ? "•" : ""}
                        </div>
                    ))}
                </div>
                <button className="text-accent text-xs font-medium mt-2">Resend OTP</button>
            </div>

            <div className="px-6 pb-6">
                <div className="grid grid-cols-3 gap-1">
                    {keys.map((key, i) => (
                        <button key={i} onClick={() => key && handleKey(key)} disabled={!key} className={`h-14 rounded-xl flex items-center justify-center transition-all ${key === "" ? "invisible" : "text-foreground text-xl font-medium active:bg-muted/30 hover:bg-muted/20"}`}>
                            {key === "delete" ? <Delete className="w-6 h-6" /> : key}
                        </button>
                    ))}
                </div>
                <button onClick={handleSubmit} disabled={otp.length < 4} className={`w-full mt-4 py-4 rounded-xl font-semibold text-base transition-all ${otp.length >= 4 ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                    Verify OTP
                </button>
            </div>
        </div>
    );
};

export default OtpEntry;
