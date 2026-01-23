// Lemon Squeezy Checkout Example

export async function createLemonCheckout() {
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: 500,
        },
        relationships: {
          store: { data: { type: "stores", id: process.env.LEMON_SQUEEZY_STORE_ID! } },
        },
      },
    }),
  });

  return res.json();
}
