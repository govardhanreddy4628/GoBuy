import { CreditCard, Wallet, Banknote } from "lucide-react";
import { PaymentMethod } from "../../pages/Checkout";
import { Card } from "../../ui/card";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

type PaymentOption = {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ElementType;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: "phonepe",
    label: "phonepe",
    description: "Cards, UPI, Netbanking & more",
    icon: CreditCard,
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive",
    icon: Banknote,
  },
];

export const PaymentMethodSelector = ({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) => {
  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(value as PaymentMethod)}
    >
      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <Card
              key={option.value}
              className={`p-4 cursor-pointer transition-colors ${isSelected ? "border-primary bg-accent" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />

                <Label
                  htmlFor={option.value}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />

                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              </div>
            </Card>
          );
        })}
      </div>
    </RadioGroup>
  );
};