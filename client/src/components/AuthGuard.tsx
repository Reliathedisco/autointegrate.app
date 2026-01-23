import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAuth } from "../hooks/use-auth";

interface AuthGuardProps {
  children: (showBilling: boolean) => ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, hasPaid, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log("[AuthGuard] Rendering:", { isLoading, isAuthenticated, hasPaid, userId: user?.id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isFromPayment = location.search.includes("from=payment");

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AutoIntegrate</h1>

          {isFromPayment ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-semibold">Payment received!</span>
                </div>
                <p className="text-green-700 text-sm">
                  Sign in to activate your account.
                </p>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <SignInButton mode="modal">
                  <button className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg">
                    Sign In to Continue
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                    Create an account instead
                  </button>
                </SignUpButton>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Create an account or sign in to get started.
              </p>
              <div className="flex flex-col gap-3 items-center">
                <SignUpButton mode="modal">
                  <button className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg">
                    Get Started
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                    I already have an account
                  </button>
                </SignInButton>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Free to sign up. Use Google, GitHub, Apple, or email.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Deterministic routing: unpaid users go to Billing (no ambiguous middle state)
  if (!hasPaid && location.pathname !== "/billing") {
    return <Navigate to="/billing" replace />;
  }

  console.log("[AuthGuard] Routing decision:", { hasPaid, showBilling: !hasPaid });
  return <>{children(!hasPaid)}</>;
}
