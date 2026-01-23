import { useAuth } from "../hooks/use-auth";
import { UserButton } from "@clerk/clerk-react";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-2 flex items-center gap-3">
      <UserButton />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{user.email || user.id}</p>
      </div>
      <button
        onClick={logout}
        className="text-sm text-gray-300 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
