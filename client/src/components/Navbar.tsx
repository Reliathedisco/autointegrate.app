import { NavLink, Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import logo from "../assets/logo.png";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3 px-4 rounded text-gray-200 transition-colors flex items-center gap-2 ${
      isActive ? "bg-gray-700" : "hover:bg-gray-800"
    }`;

  return (
    <aside className="w-56 bg-gray-900 min-h-screen text-white p-4 flex flex-col">
      <Link to="/" className="mb-8">
        <img src={logo} alt="AutoIntegrate" className="h-8" />
      </Link>

      <nav className="space-y-2 flex-1">
        <NavLink to="/" className={linkClass}>
          <span>📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/jobs" className={linkClass}>
          <span>⚡</span>
          Jobs
        </NavLink>
        <NavLink to="/templates" className={linkClass}>
          <span>📦</span>
          Templates
        </NavLink>
        <NavLink to="/sandbox" className={linkClass}>
          <span>🧪</span>
          Sandbox
        </NavLink>
        <NavLink to="/integrations" className={linkClass}>
          <span>🔌</span>
          Integrations
        </NavLink>
      </nav>

      {/* Footer with User Menu */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <UserMenu />
      </div>
    </aside>
  );
}
