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

          <div className="flex items-center gap-2 ">
            <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
            aria-label="Search"
            onClick={() => console.log("Search clicked")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.5 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17Z"
                stroke="#111827"
                strokeWidth="2"
              />
              <path
                d="M16.8 16.8 22 22"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
              <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
            aria-label="Notifications"
            onClick={() => console.log("Notifications clicked")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 17H9m10-2V11a7 7 0 1 0-14 0v4l-2 2h18l-2-2Z"
                stroke="#111827"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
            <div >
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8F3CA] text-sm font-bold text-[#1F4842]" onClick={() => setOpen(!open)}>
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
