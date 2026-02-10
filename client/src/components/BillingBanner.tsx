import { Link } from "react-router-dom";

export default function BillingBanner() {
  return (
    <div className="bg-claude-primary text-white rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
            <p className="text-sm text-white/70">Unlock all features for $29 (one-time)</p>
          </div>
        </div>
        <Link
          to="/billing"
          className="px-4 py-2 bg-white text-claude-primary rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
