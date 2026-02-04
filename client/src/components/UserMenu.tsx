import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function UserMenu() {
  const { user, hasPaid, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Guest";
  const secondaryLabel = user?.email ?? "Local access (no login required)";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-left"
      >
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="flex-1 text-sm text-gray-700 truncate">{displayName}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs text-gray-500 truncate">{secondaryLabel}</div>
              {hasPaid ? (
                <div className="text-xs text-green-600 mt-0.5">Pro</div>
              ) : (
                <div className="text-xs text-gray-400 mt-0.5">Free</div>
              )}
            </div>

            <Link
              to="/billing"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {hasPaid ? "Billing" : "Upgrade to Pro"}
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Reset local access
            </button>
          </div>
        </>
      )}
    </div>
  );
}
