export const ORDER_STATUS = [
  "created",
  "payment_pending",
  "payment_failed",
  "confirmed",
  "packed",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivery_attempted",
  "delivered",
  "cancel_requested",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];