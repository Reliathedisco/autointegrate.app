import { paddleRequest } from "./client";

export const createCheckout = async (priceId: string) => {
  return paddleRequest("/checkout", {
    items: [{ price_id: priceId, quantity: 1 }],
  });
};
