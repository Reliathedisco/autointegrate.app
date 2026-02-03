import { useCallback, useEffect, useMemo, useState } from "react";

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
  const LOCAL_PAID_KEY = "autointegrate_has_paid";

  const readHasPaid = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LOCAL_PAID_KEY) === "true";
  }, []);

  const writeHasPaid = useCallback((value: boolean) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_PAID_KEY, value ? "true" : "false");
  }, []);

  const [hasPaid, setHasPaid] = useState(readHasPaid);

  useEffect(() => {
    setHasPaid(readHasPaid());
  }, [readHasPaid]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_PAID_KEY) {
        setHasPaid(event.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const refreshPaymentStatus = useCallback(async (): Promise<boolean> => {
    const latest = readHasPaid();
    setHasPaid(latest);
    return latest;
  }, [readHasPaid]);

  const setLocalPaidStatus = useCallback(
    (value: boolean) => {
      writeHasPaid(value);
      setHasPaid(value);
    },
    [writeHasPaid]
  );

  const user = useMemo<User>(
    () => ({
      id: "guest",
      email: null,
      firstName: "Guest",
      lastName: null,
      profileImageUrl: null,
    }),
    []
  );

  const state: AuthState = {
    user,
    hasPaid,
    isLoading: false,
    isAuthenticated: true,
  };

  return {
    user: state.user,
    hasPaid: state.hasPaid,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    getAuthHeaders: async () => ({}),
    refreshPaymentStatus,
    refetch: refreshPaymentStatus,
    setLocalPaidStatus,
    logout: async () => {
      setLocalPaidStatus(false);
    },
  };
}
