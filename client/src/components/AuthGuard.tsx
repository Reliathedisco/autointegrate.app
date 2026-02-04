import { ReactNode } from "react";

interface AuthGuardProps {
  children: (showBilling: boolean) => ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children(false)}</>;
}
