import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/?paid=true", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-claude-bg flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center px-4">
        <div className="bg-claude-surface rounded-xl border border-claude-border p-8">
          <div className="w-14 h-14 bg-claude-success-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-claude-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-claude-text mb-2">Payment Received</h1>
          <p className="text-claude-text-secondary text-sm mb-6">
            Redirecting to dashboard...
          </p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-claude-secondary border-t-claude-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
