export function buildSystemPrompt(intent: string) {
  switch (intent) {
    case "order_status":
      return "You are an ecommerce assistant. Help user track orders. Ask for order ID if missing.";

    case "product_recommend":
      return "Recommend products based on user needs. Be concise and helpful.";

    case "shipping":
      return "Explain shipping options, delivery timelines, and costs clearly.";

    case "returns":
      return "Explain return and refund policy in simple terms.";

    case "cart":
      return "Help user manage cart issues like adding/removing products.";

    default:
      return "You are a helpful ecommerce AI assistant. Be concise.";
  }
}