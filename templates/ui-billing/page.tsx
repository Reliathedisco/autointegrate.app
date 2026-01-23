"use client";

export default function BillingPage() {
  const plans = [
    { id: "price_basic", name: "Basic", price: "$9/mo" },
    { id: "price_pro", name: "Pro", price: "$29/mo" },
  ];

  const checkout = async (priceId: string) => {
    const res = await fetch("/api/stripe-advanced/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
    const session = await res.json();
    window.location.href = session.url;
  };

  return (
    <div className="max-w-lg mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Billing</h1>

      {plans.map((p) => (
        <div
          key={p.id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-500">{p.price}</div>
          </div>
          <button
            onClick={() => checkout(p.id)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Choose
          </button>
        </div>
      ))}
    </div>
  );
}
