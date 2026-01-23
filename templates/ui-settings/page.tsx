"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [token, setToken] = useState("");

  return (
    <div className="space-y-8 max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-semibold">Settings</h1>

      {/* User Profile */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Profile</h2>
        <input
          className="border p-2 rounded w-full"
          placeholder="Display name"
        />
      </section>

      {/* API Token */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">API Token</h2>
        <button
          onClick={() => setToken(crypto.randomUUID())}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Generate Token
        </button>
        {token && (
          <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">{token}</pre>
        )}
      </section>

      {/* Danger Zone */}
      <section className="border border-red-300 p-4 rounded">
        <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
        <button className="text-red-600 underline mt-2">
          Delete Account
        </button>
      </section>
    </div>
  );
}
