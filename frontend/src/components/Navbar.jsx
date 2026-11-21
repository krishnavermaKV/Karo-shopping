
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  LogOut,
  UserCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <ShoppingBag size={22} />
          </div>

          <span className="text-xl font-bold text-slate-900">
            Karo <span className="text-blue-600">Shopping</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={navClass}>
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>

          <NavLink to="/stock" className={navClass}>
            <Boxes size={17} />
            Manage Stock
          </NavLink>

          <NavLink to="/billing" className={navClass}>
            <Receipt size={17} />
            Billing
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <UserCircle size={30} className="text-slate-600" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold">
                {admin?.username}
              </p>
              <p className="text-xs text-green-600">
                Admin logged in
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex justify-around border-t p-2">
        <Link to="/" className="text-xs p-2">Dashboard</Link>
        <Link to="/stock" className="text-xs p-2">Stock</Link>
        <Link to="/billing" className="text-xs p-2">Billing</Link>
      </div>
    </header>
  );
}
