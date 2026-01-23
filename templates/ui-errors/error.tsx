"use client";

export default function ErrorPage({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <h1 className="text-3xl font-semibold mb-4">Something went wrong</h1>
      <p className="text-gray-500 mb-6">{error?.message || "An unexpected error occurred"}</p>
      <div className="space-x-4">
        <button 
          onClick={reset}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
        <a href="/" className="underline">
          Go Home
        </a>
      </div>
    </div>
  );
}
