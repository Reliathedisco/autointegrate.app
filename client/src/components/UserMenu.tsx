import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function UserMenu() {
  const { user, hasPaid, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const displayName = user.firstName || user.email?.split("@")[0] || "Account";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-claude-sidebar-hover text-left transition-colors"
      >
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-claude-primary flex items-center justify-center text-xs font-medium text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-300 truncate block">{displayName}</span>
          {hasPaid && (
            <span className="text-[10px] text-claude-primary font-medium">Pro</span>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-claude-surface border border-claude-border rounded-lg shadow-lg z-20 py-1">
            <div className="px-3 py-2 border-b border-claude-border-light">
              <div className="text-xs text-claude-text-secondary truncate">{user.email}</div>
              {hasPaid ? (
                <div className="text-xs text-claude-primary mt-0.5 font-medium">Pro</div>
              ) : (
                <div className="text-xs text-claude-text-tertiary mt-0.5">Free</div>
              )}
            </div>

            <Link
              to="/billing"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-claude-text hover:bg-claude-bg transition-colors"
            >
              {hasPaid ? "Billing" : "Upgrade to Pro"}
            </Link>

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-claude-text hover:bg-claude-bg transition-colors"
            >
              Settings
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-claude-text hover:bg-claude-bg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
