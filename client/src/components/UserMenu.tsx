import { Link } from "react-router-dom";

export default function UserMenu() {
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Guest mode</div>
      <Link
        to="/billing"
        className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Support AutoIntegrate
      </Link>
    </div>
  );
}
