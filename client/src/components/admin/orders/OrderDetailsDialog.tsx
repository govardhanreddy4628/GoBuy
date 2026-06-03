import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Separator } from '../../../ui/separator';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "created" | "payment_pending"| "payment_failed"| "confirmed"| "packed"
  | "ready_to_ship"| "shipped"| "in_transit"| "out_for_delivery"| "delivered"
  | "cancelled"| "returned"| "refunded";
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
    sku: string;
    discount: number;
    inStock: boolean;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsDialog = ({ order, open, onOpenChange }: OrderDetailsDialogProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
          <DialogDescription>Order #{order.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p className="text-foreground">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                const originalPrice = item.price * item.quantity;
                const discountAmount = (originalPrice * item.discount) / 100;
                const finalPrice = originalPrice - discountAmount;
                
                return (
                  <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {item.category}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.discount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${originalPrice.toFixed(2)}
                            </p>
                          )}
                          <p className="text-sm font-medium text-foreground">
                            ${finalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>${item.price.toFixed(2)} each</span>
                        {item.discount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">{item.discount}% off</span>
                          </>
                        )}
                        <span>•</span>
                        <span className={item.inStock ? "text-green-600" : "text-red-600"}>
                          {item.inStock ? "In Stock" : "Low Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Shipping Address</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
