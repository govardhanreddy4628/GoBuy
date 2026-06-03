import { cn } from "../../../lib/utils";
import { Badge } from "../../../ui/badge";
import { OrderStatus } from "../types/order";



interface OrderStatusBadgeProps {
  status: OrderStatus;
}

// const statusConfig = {
//   pending: {
//     label: "Pending",
//     className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
//   },
//   processing: {
//     label: "Processing",
//     className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
//   },
//   shipped: {
//     label: "Shipped",
//     className: "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20",
//   },
//   delivered: {
//     label: "Delivered",
//     className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
//   },
//   cancelled: {
//     label: "Cancelled",
//     className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
//   },
// };

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  created: { label: "Created", className: "bg-gray-100 text-gray-600" },

  payment_pending: { label: "Payment Pending", className: "bg-yellow-100 text-yellow-700" },
  payment_failed: { label: "Payment Failed", className: "bg-red-100 text-red-700" },

  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  packed: { label: "Packed", className: "bg-indigo-100 text-indigo-700" },
  ready_to_ship: { label: "Ready to Ship", className: "bg-purple-100 text-purple-700" },

  shipped: { label: "Shipped", className: "bg-cyan-100 text-cyan-700" },
  in_transit: { label: "In Transit", className: "bg-teal-100 text-teal-700" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-orange-100 text-orange-700" },

  delivery_attempted: { label: "Delivery Attempted", className: "bg-orange-200 text-orange-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-700" },

  cancel_requested: { label: "Cancel Requested", className: "bg-red-100 text-red-600"},
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },

  return_requested: { label: "Return Requested", className: "bg-pink-100 text-pink-600" },
  returned: { label: "Returned", className: "bg-red-200 text-red-800" },
  refunded: { label: "Refunded", className: "bg-pink-100 text-pink-700" },
};


export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-500">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};
