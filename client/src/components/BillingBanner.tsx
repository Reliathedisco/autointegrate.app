import { Link } from "react-router-dom";

export default function BillingBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <p className="text-sm text-blue-100">Unlock unlimited integrations and all features for $29 (one-time)</p>
          </div>
        </div>
        <Link
          to="/billing"
          className="flex-shrink-0 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
