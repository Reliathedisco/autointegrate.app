import { Link } from "react-router-dom";

export default function ProRequiredModal(props: {
  open: boolean;
  onClose: () => void;
  actionLabel?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const {
    open,
    onClose,
    actionLabel = "this action",
    description = "Upgrade to Pro to unlock this feature.",
    ctaHref = "/billing",
    ctaLabel = "Unlock Pro",
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Pro required</h2>
          <p className="text-gray-600 text-sm mt-1">
            You’ll need Pro to use {actionLabel}.
          </p>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium text-sm mb-1">What you get</p>
            <p className="text-blue-700 text-sm">{description}</p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Not now
          </button>
          <Link
            to={ctaHref}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={onClose}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

