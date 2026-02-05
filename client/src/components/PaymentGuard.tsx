import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

interface PaymentGuardProps {
  children: ReactNode;
}

export default function PaymentGuard({ children }: PaymentGuardProps) {
  const { hasPaid, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !hasPaid && location.pathname !== "/billing") {
      navigate("/billing");
    }
  }, [hasPaid, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  if (!hasPaid) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
