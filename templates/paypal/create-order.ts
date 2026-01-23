import { paypalFetch } from "./client";

export const createOrder = async (amount: string) => {
  return paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
    }),
  });
};
