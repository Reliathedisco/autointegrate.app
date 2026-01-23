import { paypalFetch } from "./client";

export const captureOrder = async (orderId: string) => {
  return paypalFetch(`/v2/checkout/orders/${orderId}/capture`, { method: "POST" });
};
