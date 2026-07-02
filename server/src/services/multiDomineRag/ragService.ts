import { detectDomain } from "./intentRouter.js";
import { getOrderContext } from "./ordersRag.js";
import { getProductContext } from "./productsRag.js";
// import { getCartContext } from "./cartRag.js";

export async function getRagContext(
  userId: string,
  message: string,
  productId?: string,
): Promise<string> {
  const domain = detectDomain(message);

  switch (domain) {
    case "orders":
      return await getOrderContext(userId, message);

    case "products":
      return await getProductContext(message, productId);

    // case "cart":
    //   return await getCartContext(userId);

    default:
      return "";
  }
}
