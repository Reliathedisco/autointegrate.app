import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const location = useLocation();

  const isFromPayment = location.search.includes("from=payment") || location.search.includes("paid=true");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setDevLink(null);

    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setMessage({ 
        type: "success", 
        text: "Check your email! We sent you a sign-in link." 
      });
      setEmail("");
      
      // Show dev link if available (local development)
      if (data.devLink) {
        setDevLink(data.devLink);
      }
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.message || "Something went wrong. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AutoIntegrate</h1>
            <p className="text-gray-600">
              Add API integrations to your projects in minutes.
            </p>
          </div>

          {isFromPayment && (
            <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-6 text-center border border-green-200">
              <p className="font-semibold">Payment received!</p>
              <p className="text-sm mt-1">Sign in to access your dashboard.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          {devLink && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold text-sm mb-2">Dev Mode - Direct Link:</p>
              <a 
                href={devLink} 
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {devLink}
              </a>
            </div>
          )}

          <p className="text-gray-500 text-xs text-center mt-6">
            No password needed. We'll email you a secure link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
