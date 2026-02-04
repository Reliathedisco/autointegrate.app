"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await signIn("email", { email, redirect: false });
    if ((res as any)?.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-sm mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-4">Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="you@example.com"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-black text-white w-full py-2 rounded"
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-green-600">Check your email for the magic link.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong, please try again.</p>
        )}
      </form>
    </div>
  );
}
