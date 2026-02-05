import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: User | null;
  hasPaid: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/me", {
        credentials: "include", // Include session cookie
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("[useAuth] /api/me response:", {
          hasPaid: data.hasPaid,
          userId: data.user?.id,
        });
        setUser(data.user || null);
        setHasPaid(data.hasPaid === true);
      } else {
        console.log("[useAuth] /api/me returned", res.status);
        setUser(null);
        setHasPaid(false);
      }
    } catch (error) {
      console.error("[useAuth] Error fetching /api/me:", error);
      setUser(null);
      setHasPaid(false);
    } finally {
      setIsLoading(false);
    }
    
    return { data: { hasPaid } };
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const state: AuthState = {
    user,
    hasPaid,
    isLoading,
    isAuthenticated: Boolean(user),
  };

  return {
    user: state.user,
    hasPaid: state.hasPaid,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    getAuthHeaders: async () => ({}), // Session-based, no headers needed
    refetch: fetchUser,
    logout: async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        setUser(null);
        setHasPaid(false);
        navigate("/", { replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    },
  };
}
