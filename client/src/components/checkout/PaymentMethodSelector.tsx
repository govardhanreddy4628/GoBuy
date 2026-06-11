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
          className={`p-4 cursor-pointer transition-all border
          bg-white dark:bg-gray-900
          border-gray-200 dark:border-gray-700
          ${
            isSelected
              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
              : "hover:shadow-sm"
          }`}
        >
          <div className="flex items-center space-x-3">
            
            {/* ✅ RED RADIO */}
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="
                border-gray-500 dark:border-gray-400
                text-red-500
                data-[state=checked]:border-red-500
                data-[state=checked]:bg-red-500
                data-[state=checked]:text-white
              "
            />

            <Label
              htmlFor={option.value}
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />

              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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