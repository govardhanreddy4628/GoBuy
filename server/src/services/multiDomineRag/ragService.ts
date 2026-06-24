import { getOrderContext } from "./orders.js";
import { getCartContext } from "./cart.js";
import { getProductContext } from "./productRagContext.js";
import { detectDomain } from "./intentRouter.js";

export async function getRagContext(userId: string, message: string, productId?: string) {
  const domain = detectDomain(message);

  switch (domain) {
    case "orders":
      return await getOrderContext(userId, message);

    case "cart":
      return await getCartContext(userId);

    case "products":
      return await getProductContext(message, productId);

    default:
      return "";
  }
}