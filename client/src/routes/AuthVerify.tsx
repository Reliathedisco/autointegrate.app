import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your magic link...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one.");
      return;
    }

    // The backend will handle the redirect, but show a loading state
    // If we get here, it means the backend redirect didn't work
    const timer = setTimeout(() => {
      setStatus("error");
      setMessage("Verification taking too long. Please try again.");
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {status === "verifying" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing you in</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <a 
                href="/" 
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
