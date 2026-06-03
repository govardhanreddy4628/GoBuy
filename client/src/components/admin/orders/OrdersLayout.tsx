import { OrderStats } from "./OrderStats";
import { ReactNode } from "react";
import { Order } from "./OrderDetailsDialog";

interface Props {
  showHeader?: boolean;
  showStats?: boolean;
  orders: Order[];
  totalOrders: number;
  children: ReactNode;
}

const OrdersLayout = ({
  showHeader = true,
  showStats = true,
  orders,
  totalOrders,
  children,
}: Props) => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {showHeader && (
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage customer orders in real-time
          </p>
        </div>
      )}

      {showStats && (
        <OrderStats orders={orders} totalOrders={totalOrders} />
      )}

      {children}
    </div>
  );
};

export default OrdersLayout;