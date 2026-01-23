"use client";

export default function Login() {
  const submit = async (e: any) => {
    e.preventDefault();
    // Connect to your auth provider here
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto py-20 space-y-4">
      <h1 className="text-3xl font-semibold">Login</h1>
      <input
        className="border p-2 rounded w-full"
        placeholder="Email"
        type="email"
      />
      <input
        className="border p-2 rounded w-full"
        placeholder="Password"
        type="password"
      />
      <button className="bg-black text-white w-full py-2 rounded">
        Sign In
      </button>
    </form>
  );
}
