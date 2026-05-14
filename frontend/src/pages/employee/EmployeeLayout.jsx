import { Outlet, NavLink } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/auth/useAuth";

export default function EmployeeLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F0]">
      {/* Navbar */}
      <div className="px-8 py-3">
        <div className="flex items-center justify-between rounded-full bg-white px-5 py-[10px]">
          <div className="text-lg font-extrabold text-[#212429]">
            <img
              src="./Dark-variation-logo.png"
              alt="Skillminds Logo"
              className="h-10 w-100%"
            />
          </div>

          <div className="flex gap-2 rounded-full bg-[#EEF2F5] p-1">
            <NavLink
              to="/employee/dashboard"
              end
              className={({ isActive }) =>
                `rounded-full px-[22px] py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[#1F4842] text-white"
                    : "bg-[#b9f27c] text-[#1f4845]"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/employee/courses"
              className={({ isActive }) =>
                `rounded-full px-[22px] py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[#1F4842] text-white"
                    : "bg-[#b9f27c] text-[#1f4845]"
                }`
              }
            >
              My Course
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            <Search size={18} />
            <Bell size={18} />

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D8F3CA] text-sm font-bold text-[#1F4842]">
              <button onClick={() => setOpen(!open)}>
                {(
                  user?.first_name?.[0] ||
                  user?.last_name?.[0] ||
                  user?.email?.[0] ||
                  "U"
                ).toUpperCase()}
              </button>
            </div>
            {open && (
              <div className="absolute top-12 right-0 mt-2 w-24 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10">
                <button
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/employee/settings");
                  }}
                >
                  Settings
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
}
