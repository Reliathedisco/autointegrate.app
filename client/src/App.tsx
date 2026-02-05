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
import AuthVerify from "./routes/AuthVerify";
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
      
      // Poll for payment status with exponential backoff
      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = async () => {
        const result = await refetch();
        attempts++;
        
        // Check if payment verified
        if (result.data?.hasPaid) {
          console.log(`[Payment] Verified after ${attempts} attempt(s)`);
          setIsProcessing(false);
          
          // Clear the parameter after 2 seconds
          setTimeout(() => {
            setShow(false);
            searchParams.delete("paid");
            setSearchParams(searchParams, { replace: true });
          }, 2000);
          return;
        }
        
        // Continue polling if not verified yet
        if (attempts < maxAttempts) {
          const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 5000); // 2s, 3s, 4.5s, 5s, 5s
          setTimeout(pollInterval, delay);
        } else {
          console.warn(`[Payment] Not verified after ${attempts} attempts`);
          setIsProcessing(false);
        }
      };
      
      // Start polling after 1 second to give webhook time
      const startPolling = setTimeout(pollInterval, 1000);
      
      return () => {
        clearTimeout(startPolling);
      };
    }
  }, [searchParams, setSearchParams, refetch]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <div className={`border rounded-lg p-4 shadow-lg max-w-md ${
        isProcessing 
          ? "bg-blue-50 border-blue-200" 
          : "bg-green-50 border-green-200"
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isProcessing ? "text-blue-900" : "text-green-900"}`}>
              {isProcessing ? "Processing Payment..." : "Payment Verified!"}
            </h3>
            <p className={`text-sm mt-1 ${isProcessing ? "text-blue-700" : "text-green-700"}`}>
              {isProcessing 
                ? "Confirming your payment. This may take a moment..." 
                : "Welcome to Pro. All features are now unlocked."}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={() => setShow(false)}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Public routes (no auth required)
  if (location.pathname === "/auth/verify") {
    return <AuthVerify />;
  }

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
        <div className="flex min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1 p-6">
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
