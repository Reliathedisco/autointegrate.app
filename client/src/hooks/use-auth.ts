import { useCallback } from "react";

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
  const refreshPaymentStatus = useCallback(async (): Promise<boolean> => true, []);

  const state: AuthState = {
    user: {
      id: "guest",
      email: null,
      firstName: "Guest",
      lastName: null,
      profileImageUrl: null,
    },
    hasPaid: true,
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
    refetch: async () => {},
    logout: async () => {},
  };
}
