import { Card } from "../../ui/card";
import { Separator } from "../../ui/separator";


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
}

export const OrderSummary = ({ items, subtotal, shipping, tax, total }: OrderSummaryProps) => {
  return (
   <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
    Order Summary
  </h2>
  
  <div className="space-y-4">
    {items.map((item) => (
      <div key={item.id} className="flex gap-3">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-gray-800"
        />
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {item.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Qty: {item.quantity}
          </p>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100">
          ₹{item.price * item.quantity}
        </p>
      </div>
    ))}
  </div>

  <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
      <span className="text-gray-900 dark:text-gray-100">₹{subtotal}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
      <span className="text-gray-900 dark:text-gray-100">₹{shipping}</span>
    </div>
    {/* <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Tax (18%)</span>
      <span>₹{tax}</span>
    </div> */}
    
    <Separator className="my-2 bg-gray-200 dark:bg-gray-700" />
    
    <div className="flex justify-between font-semibold text-lg">
      <span className="text-gray-900 dark:text-gray-100">Total</span>
      <span className="text-gray-900 dark:text-gray-100">₹{total}</span>
    </div>
  </div>
</Card>
  );
};
