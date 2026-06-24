import Order from "../../models/orderModel.js";


export async function getOrderContext(userId: string, message: string) {
  const msg = message.toLowerCase();

  // 🔥 dynamic query building
  let sort: any = { createdAt: -1 };

  if (msg.includes("cheapest") || msg.includes("less")) {
    sort = { totalAmount: 1 };
  }

  const orders = await Order.find({ userId })
    .sort(sort)
    .limit(3);

  return orders.map(o => `
Order ID: ${o._id}
Total: ${o.totalAmount}
Status: ${o.status}
Delivery: ${o.deliveryDate}
Payment: ${o.paymentMethod}
Items: ${o.items.map(i => i.name).join(", ")}
`).join("\n");
}