import Order, { IOrder } from "../../models/orderModel.js";

export async function getOrderContext(
  userId: string,
  message: string
): Promise<string> {
  const msg = message.toLowerCase();

  // 🔥 dynamic query building
  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  if (msg.includes("cheapest") || msg.includes("less")) {
    sort = { totalAmount: 1 };
  }

  const orders: IOrder[] = await Order.find({ userId })
    .sort(sort)
    .limit(3);

  return orders
    .map(
      (o) => `
Order ID: ${o._id}
Total: ${o.totalAmount}
Order Status: ${o.orderStatus}
Delivery Status: ${o.deliveryStatus}
Payment Status: ${o.paymentStatus}
Items: ${o.items.map((i) => i.name).join(", ")}
`
    )
    .join("\n");
}