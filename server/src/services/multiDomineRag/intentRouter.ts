export type Domain = "orders" | "cart" | "products" | "general";

export function detectDomain(message: string): Domain {
  const msg = message.toLowerCase();

  if (msg.match(/order|delivery|payment|purchase/)) return "orders";
  if (msg.match(/cart|added|remove|checkout/)) return "cart";
  if (msg.match(/product|item|price|buy|available/)) return "products";

  return "general";
}