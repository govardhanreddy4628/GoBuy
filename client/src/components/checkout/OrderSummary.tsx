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
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-16 h-16 rounded-md object-cover bg-muted"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>₹{shipping}</span>
        </div>
        {/* <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (18%)</span>
          <span>₹{tax}</span>
        </div> */}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
    </Card>
  );
};
