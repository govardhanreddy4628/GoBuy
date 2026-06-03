import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Smartphone, CreditCard, Building2, ShieldCheck, Copy, Check, User, Lock } from "lucide-react";
import QRCode from "qrcode";
import { BankInfo, GatewayMethod } from "./payment";


type GatewayStep = "methods" | "upi" | "card" | "netbanking" | "netbanking-login";

interface Props {
  amount: number;
  merchantName?: string;
  onProceedToPin: (method: GatewayMethod, bank?: BankInfo) => void;
  onBack?: () => void;
}

const banks: BankInfo[] = [
  { name: "State Bank of India", code: "SBI", color: "220 80% 45%" },
  { name: "HDFC Bank", code: "HDFC", color: "210 70% 40%" },
  { name: "ICICI Bank", code: "ICICI", color: "15 80% 50%" },
  { name: "Axis Bank", code: "AXIS", color: "340 70% 45%" },
  { name: "Kotak Mahindra", code: "KTK", color: "0 75% 50%" },
];

const TEST_CARD = {
  number: "4111 1111 1111 1111",
  name: "Test User",
  expiry: "12/28",
  cvv: "123",
};

const PhonepeGateway = ({ amount, merchantName = "Merchant", onProceedToPin, onBack }: Props) => {
  const [step, setStep] = useState<GatewayStep>("methods");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [nbUserId, setNbUserId] = useState("");
  const [nbPassword, setNbPassword] = useState("");

  const formattedAmount = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // Generate real QR code
  useEffect(() => {
    const upiLink = `upi://pay?pa=merchant@phonepe&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Payment`;
    QRCode.toDataURL(upiLink, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [amount, merchantName]);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const fillTestCard = () => {
    setCardNumber(TEST_CARD.number);
    setCardName(TEST_CARD.name);
    setCardExpiry(TEST_CARD.expiry);
    setCardCvv(TEST_CARD.cvv);
  };

  const Header = ({ title, showBack = true }: { title: string; showBack?: boolean }) => (
    <div className="bg-primary px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button onClick={() => {
          if (step === "methods") onBack?.();
          else if (step === "netbanking-login") setStep("netbanking");
          else setStep("methods");
        }}>
          <ChevronLeft className="w-6 h-6 text-primary-foreground" />
        </button>
      )}
      <span className="text-primary-foreground font-semibold text-base flex-1">{title}</span>
      <ShieldCheck className="w-5 h-5 text-primary-foreground/60" />
    </div>
  );

  // METHODS SCREEN
  if (step === "methods") {
    return (
      <div className="flex flex-col h-full min-h-[700px]">
        <Header title="PhonePe" showBack={!!onBack} />
        <div className="px-5 pt-6 pb-5">
          <p className="text-muted-foreground text-xs mb-1">PAYING TO {merchantName.toUpperCase()}</p>
          <p className="text-foreground text-4xl font-bold">₹{formattedAmount}</p>
        </div>
        <div className="border-t border-phonepe-divider mx-5" />
        <div className="px-5 pt-5 flex-1">
          <p className="text-muted-foreground text-xs mb-4">PAYMENT METHODS</p>
          <div className="space-y-3">
            <button onClick={() => setStep("upi")} className="w-full bg-card rounded-xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:brightness-110">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center"><Smartphone className="w-5 h-5 text-accent" /></div>
              <div className="flex-1 text-left"><p className="text-foreground text-sm font-semibold">UPI</p><p className="text-muted-foreground text-xs">Pay using UPI ID or QR</p></div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => setStep("card")} className="w-full bg-card rounded-xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:brightness-110">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center"><CreditCard className="w-5 h-5 text-accent" /></div>
              <div className="flex-1 text-left"><p className="text-foreground text-sm font-semibold">Debit / Credit Card</p><p className="text-muted-foreground text-xs">Visa, Mastercard, RuPay</p></div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => setStep("netbanking")} className="w-full bg-card rounded-xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:brightness-110">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-accent" /></div>
              <div className="flex-1 text-left"><p className="text-foreground text-sm font-semibold">Net Banking</p><p className="text-muted-foreground text-xs">All Indian banks</p></div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="px-5 pb-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-phonepe-success" />
          <span className="text-muted-foreground text-xs">Secured by PhonePe</span>
        </div>
      </div>
    );
  }

  // UPI SCREEN — real QR
  if (step === "upi") {
    return (
      <div className="flex flex-col h-full min-h-[700px]">
        <Header title="Pay via UPI" />
        <div className="px-5 pt-5 flex-1">
          <div className="bg-card rounded-xl p-6 flex flex-col items-center mb-5">
            <div className="w-44 h-44 rounded-xl flex items-center justify-center mb-3 bg-primary-foreground p-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI QR Code" className="w-full h-full rounded-lg" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Generating...</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs">Scan using PhonePe / GPay / Paytm</p>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-phonepe-divider" />
            <span className="text-muted-foreground text-xs">OR</span>
            <div className="flex-1 border-t border-phonepe-divider" />
          </div>
          <p className="text-muted-foreground text-xs mb-2">ENTER UPI ID</p>
          <div className="bg-card rounded-xl overflow-hidden">
            <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full bg-transparent px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none" />
          </div>
        </div>
        <div className="px-5 pb-6">
          <button onClick={() => onProceedToPin("upi")} disabled={!upiId.includes("@")} className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${upiId.includes("@") ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            Pay ₹{formattedAmount}
          </button>
        </div>
      </div>
    );
  }

  // CARD SCREEN — with test card banner
  if (step === "card") {
    const isCardValid = cardNumber.replace(/\s/g, "").length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.length > 2;
    return (
      <div className="flex flex-col h-full min-h-[700px]">
        <Header title="Debit / Credit Card" />
        <div className="px-5 pt-5 flex-1 space-y-4">
          {/* Test Card Banner */}
          <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-accent text-xs font-semibold">🧪 TEST CARD</span>
            <span className="text-muted-foreground text-xs">— This is a simulated payment</span>
          </div>

          {/* Realistic Test Card */}
          <div
            className="relative w-full aspect-[1.586/1] max-w-[340px] mx-auto rounded-2xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
            style={{
              background: "linear-gradient(135deg, hsl(220 70% 25%), hsl(250 60% 35%), hsl(280 50% 30%))",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            onClick={fillTestCard}
          >
            {/* Chip & contactless */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90" />
              <svg className="w-6 h-6 text-primary-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8.5 18.5C12 18.5 15 15.5 15 12S12 5.5 8.5 5.5" /><path d="M5.5 16C8 16 10.5 14 10.5 12S8 8 5.5 8" /><path d="M3 13.5C4 13.5 6 13 6 12S4 10.5 3 10.5" />
              </svg>
            </div>
            {/* Card number */}
            <p className="text-primary-foreground font-mono text-base tracking-[0.2em] mt-3">{TEST_CARD.number}</p>
            {/* Bottom row */}
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-primary-foreground/50 text-[9px] uppercase tracking-wider">Card Holder</p>
                <p className="text-primary-foreground text-xs font-semibold tracking-wider uppercase">{TEST_CARD.name}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/50 text-[9px] uppercase tracking-wider">Expires</p>
                <p className="text-primary-foreground text-xs font-semibold">{TEST_CARD.expiry}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/50 text-[9px] uppercase tracking-wider">CVV</p>
                <p className="text-primary-foreground text-xs font-semibold">{TEST_CARD.cvv}</p>
              </div>
            </div>
            {/* Visa logo */}
            <div className="absolute top-4 right-5">
              <span className="text-primary-foreground font-bold text-lg italic tracking-tight opacity-80">VISA</span>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
            <div className="absolute -right-4 top-8 w-24 h-24 rounded-full bg-primary-foreground/5" />
          </div>
          {/* Tap hint below card */}
          <p className="text-center text-accent text-xs font-medium -mt-2">👆 Tap the card above to auto-fill details</p>

          <div><p className="text-muted-foreground text-xs mb-2">CARD NUMBER</p><div className="bg-card rounded-xl overflow-hidden"><input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" className="w-full bg-transparent px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none tracking-wider" maxLength={19} /></div></div>
          <div><p className="text-muted-foreground text-xs mb-2">CARDHOLDER NAME</p><div className="bg-card rounded-xl overflow-hidden"><input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className="w-full bg-transparent px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none" /></div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-muted-foreground text-xs mb-2">EXPIRY</p><div className="bg-card rounded-xl overflow-hidden"><input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-full bg-transparent px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none" maxLength={5} /></div></div>
            <div><p className="text-muted-foreground text-xs mb-2">CVV</p><div className="bg-card rounded-xl overflow-hidden"><input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="•••" className="w-full bg-transparent px-4 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none" maxLength={3} /></div></div>
          </div>
          <div className="flex items-center gap-2 pt-2"><ShieldCheck className="w-4 h-4 text-phonepe-success" /><span className="text-muted-foreground text-xs">Your card details are encrypted and secure</span></div>
        </div>
        <div className="px-5 pb-6">
          <button onClick={() => onProceedToPin("card")} disabled={!isCardValid} className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${isCardValid ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            Pay ₹{formattedAmount}
          </button>
        </div>
      </div>
    );
  }

  // NET BANKING LOGIN SCREEN
  if (step === "netbanking-login") {
    const bank = banks.find((b) => b.code === selectedBank);
    const isLoginValid = nbUserId.length >= 4 && nbPassword.length >= 4;
    return (
      <div className="flex flex-col h-full min-h-[700px]">
        <Header title={bank?.name || "Net Banking"} />
        <div className="px-5 pt-5 flex-1">
          {/* Bank branding header */}
          <div className="bg-card rounded-xl p-5 flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${bank?.color})` }}>
              <span className="text-primary-foreground font-bold text-xs">{bank?.code}</span>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">{bank?.name}</p>
              <p className="text-muted-foreground text-xs">Internet Banking Login</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-xs mb-2">USER ID / CUSTOMER ID</p>
              <div className="bg-card rounded-xl overflow-hidden flex items-center">
                <div className="pl-4"><User className="w-4 h-4 text-muted-foreground" /></div>
                <input
                  type="text"
                  value={nbUserId}
                  onChange={(e) => setNbUserId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full bg-transparent px-3 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
                />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-2">PASSWORD</p>
              <div className="bg-card rounded-xl overflow-hidden flex items-center">
                <div className="pl-4"><Lock className="w-4 h-4 text-muted-foreground" /></div>
                <input
                  type="password"
                  value={nbPassword}
                  onChange={(e) => setNbPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-transparent px-3 py-3.5 text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
                />
              </div>
            </div>

            {/* Test credentials hint */}
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-3">
              <p className="text-accent text-xs font-semibold mb-1">🧪 Simulation Mode</p>
              <p className="text-muted-foreground text-xs">Enter any User ID &amp; Password (min 4 chars each) to proceed</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-phonepe-success" />
              <span className="text-muted-foreground text-xs">Secured by {bank?.name}</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-6">
          <button
            onClick={() => {
              if (bank) onProceedToPin("netbanking", bank);
            }}
            disabled={!isLoginValid}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${isLoginValid ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
          >
            Login & Pay ₹{formattedAmount}
          </button>
        </div>
      </div>
    );
  }

  // NET BANKING — bank selection
  return (
    <div className="flex flex-col h-full min-h-[700px]">
      <Header title="Net Banking" />
      <div className="px-5 pt-5 flex-1">
        <p className="text-muted-foreground text-xs mb-4">SELECT YOUR BANK</p>
        <div className="space-y-2.5">
          {banks.map((bank) => (
            <button key={bank.code} onClick={() => setSelectedBank(bank.code)} className={`w-full bg-card rounded-xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] ${selectedBank === bank.code ? "ring-2 ring-accent" : ""}`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${bank.color})` }}>
                <span className="text-primary-foreground font-bold text-[10px]">{bank.code}</span>
              </div>
              <span className="text-foreground text-sm font-medium flex-1 text-left">{bank.name}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBank === bank.code ? "border-accent bg-accent" : "border-muted-foreground/40"}`}>
                {selectedBank === bank.code && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-6">
        <button
          onClick={() => setStep("netbanking-login")}
          disabled={!selectedBank}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${selectedBank ? "bg-accent text-accent-foreground active:scale-[0.98] hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PhonepeGateway;
