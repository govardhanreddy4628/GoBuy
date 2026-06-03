import { Card, CardContent } from "../../../ui/card";
import { Package, Clock, Truck, CheckCircle2 } from "lucide-react";
import { Order } from "./OrderDetailsDialog";

interface OrderStatsProps {
  orders: Order[];
  totalOrders: number;
}

export const OrderStats = ({ orders, totalOrders }: OrderStatsProps) => {
  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: orders.filter((o) => o.status === "created").length,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "In Transit",
      value: orders.filter((o) => ["confirmed","packed","shipped"].includes(o.status)).length,
      icon: Truck,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="hover:shadow-md transition-all duration-200 animate-fade-in border-border"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card
        className="hover:shadow-md transition-all duration-200 animate-fade-in border-border"
        style={{ animationDelay: "200ms" }}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
