export const paypalConfig = {
  name: "PayPal",
  requiredEnv: [
    "PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET",
    "PAYPAL_MODE" // sandbox or live
  ],
  description: "PayPal Orders API with capture route.",
};
