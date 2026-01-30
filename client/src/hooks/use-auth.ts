import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

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
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isSignedIn, getToken, signOut } = useClerkAuth();
  const navigate = useNavigate();

  const [hasPaid, setHasPaid] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      if (!isClerkLoaded) return;

      if (!isSignedIn) {
        setHasPaid(false);
        setIsBillingLoading(false);
        return;
      }

      const token = await getToken();
      const res = await fetch("/api/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[useAuth] /api/me response:", {
          hasPaid: data.hasPaid,
          userId: data.user?.id,
        });
        setHasPaid(data.hasPaid === true);
        setIsBillingLoading(false);
      } else {
        console.log("[useAuth] /api/me returned", res.status);
        setHasPaid(false);
        setIsBillingLoading(false);
      }
    } catch (error) {
      console.error("[useAuth] Error fetching /api/me:", error);
      setHasPaid(false);
      setIsBillingLoading(false);
    }
  }, [getToken, isClerkLoaded, isSignedIn]);

  const refreshPaymentStatus = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getToken();
      const res = await fetch("/api/me/refresh", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[useAuth] /api/me/refresh response:", { hasPaid: data.hasPaid });
        setHasPaid(data.hasPaid === true);
        return data.hasPaid === true;
      }
      return false;
    } catch (error) {
      console.error("[useAuth] Error refreshing payment status:", error);
      return false;
    }
  }, [getToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const mappedUser: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        firstName: clerkUser.firstName ?? null,
        lastName: clerkUser.lastName ?? null,
        profileImageUrl: clerkUser.imageUrl ?? null,
      }
    : null;

  const state: AuthState = {
    user: mappedUser,
    hasPaid,
    isLoading: !isClerkLoaded || isBillingLoading,
    isAuthenticated: Boolean(isSignedIn),
  };

  return {
    user: state.user,
    hasPaid: state.hasPaid,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    getAuthHeaders: async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    refreshPaymentStatus,
    refetch: fetchUser,
    logout: async () => {
      try {
        await signOut();
        navigate("/", { replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    },
  };
}
