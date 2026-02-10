import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Dashboard from "./routes/Dashboard";
import Jobs from "./routes/Jobs";
import Templates from "./routes/Templates";
import Sandbox from "./routes/Sandbox";
import Integrations from "./routes/Integrations";
import Settings from "./routes/Settings";
import Billing from "./routes/Billing";
import PaymentSuccess from "./routes/PaymentSuccess";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient();

function PaymentNotification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refetch, hasPaid } = useAuth();

  useEffect(() => {
    if (searchParams.get("paid") === "true") {
      setShow(true);
      setIsProcessing(true);

      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = async () => {
        const result = await refetch();
        attempts++;

        if (result.data?.hasPaid) {
          console.log(`[Payment] Verified after ${attempts} attempt(s)`);
          setIsProcessing(false);

          setTimeout(() => {
            setShow(false);
            searchParams.delete("paid");
            setSearchParams(searchParams, { replace: true });
          }, 2000);
          return;
        }

        if (attempts < maxAttempts) {
          const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 5000);
          setTimeout(pollInterval, delay);
        } else {
          console.warn(`[Payment] Not verified after ${attempts} attempts`);
          setIsProcessing(false);
        }
      };

      const startPolling = setTimeout(pollInterval, 1000);

      return () => {
        clearTimeout(startPolling);
      };
    }
  }, [searchParams, setSearchParams, refetch]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`border rounded-xl p-4 shadow-lg max-w-md ${
        isProcessing
          ? "bg-claude-primary-light border-claude-primary/20"
          : "bg-claude-success-light border-claude-success/20"
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-claude-primary border-t-transparent"></div>
            ) : (
              <svg className="w-5 h-5 text-claude-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-medium text-sm ${isProcessing ? "text-claude-primary-hover" : "text-claude-success"}`}>
              {isProcessing ? "Processing Payment..." : "Payment Verified"}
            </h3>
            <p className={`text-xs mt-0.5 ${isProcessing ? "text-claude-text-secondary" : "text-claude-success"}`}>
              {isProcessing
                ? "Confirming your payment..."
                : "Welcome to Pro. All features unlocked."}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={() => setShow(false)}
              className="flex-shrink-0 text-claude-success hover:text-claude-success/80"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  if (location.pathname === "/payment-success") {
    return <PaymentSuccess />;
  }

  if (location.pathname === "/billing" && location.search.includes("success=true")) {
    return <PaymentSuccess />;
  }

  return (
    <>
      <PaymentNotification />
      <AuthGuard>
        <div className="flex min-h-screen bg-claude-bg">
          <Navbar />
          <main className="flex-1 p-8 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
            </Routes>
          </main>
        </div>
      </AuthGuard>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
