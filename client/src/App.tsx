import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();

  // Handle payment success page without auth guard
  if (location.pathname === "/payment-success") {
    return <PaymentSuccess />;
  }

  if (location.pathname === "/billing" && location.search.includes("success=true")) {
    return <PaymentSuccess />;
  }

  return (
    <AuthGuard>
      {() => (
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
      )}
    </AuthGuard>
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
