import { NavLink, Link } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-3 rounded text-sm transition-colors ${
      isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <aside className="w-48 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <Link to="/" className="px-4 py-4 border-b border-gray-100">
        <span className="font-semibold text-gray-900">AutoIntegrate</span>
      </Link>

      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/sandbox" className={linkClass}>Sandbox</NavLink>
        <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
        <NavLink to="/templates" className={linkClass}>Templates</NavLink>
        <NavLink to="/integrations" className={linkClass}>Integrations</NavLink>
      </nav>

      <div className="border-t border-gray-200 p-3">
        <UserMenu />
      </div>
    </aside>
  );
}
