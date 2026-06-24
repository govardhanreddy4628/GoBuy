export function detectIntent(message: string) {
  const msg = message.toLowerCase();

  if (msg.includes("order")) return "order_status";
  if (msg.includes("recommend")) return "product_recommend";
  if (msg.includes("shipping")) return "shipping";
  if (msg.includes("return") || msg.includes("refund")) return "returns";
  if (msg.includes("cart")) return "cart";

  return "general";
}