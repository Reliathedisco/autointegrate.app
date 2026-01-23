"use client";

export default function Signup() {
  const submit = (e: any) => {
    e.preventDefault();
    // Connect to your auth provider here
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto py-20 space-y-4">
      <h1 className="text-3xl font-semibold">Create Account</h1>
      <input className="border p-2 rounded w-full" placeholder="Email" />
      <input className="border p-2 rounded w-full" placeholder="Password" type="password" />

      <button className="bg-black text-white w-full py-2 rounded">
        Sign Up
      </button>
    </form>
  );
}
