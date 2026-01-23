import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const listPrices = async (productId?: string) => {
  return stripe.prices.list({
    active: true,
    ...(productId && { product: productId }),
    expand: ["data.product"],
  });
};

export const createPrice = async (productId: string, unitAmount: number, interval: "month" | "year") => {
  return stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: { interval },
  });
};
