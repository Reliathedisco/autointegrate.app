import { Link } from "react-router-dom";

export default function PaymentBanner() {
  return (
    <div className="bg-blue-600 text-white px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl">&#128274;</span>
          <div>
            <p className="font-medium">Unlock Full Access</p>
            <p className="text-blue-100 text-sm">One-time $29 payment. No subscriptions.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/billing"
            className="text-blue-100 hover:text-white text-sm underline"
          >
            Learn more
          </Link>
          <Link
            to="/billing"
            className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            Unlock Now
          </Link>
        </div>
      </div>
    </div>
  );
}
