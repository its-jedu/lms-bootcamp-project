import { Outlet, NavLink } from "react-router-dom";
import { Bell, Search } from "lucide-react";

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-[#F2F2F0]">
      
      {/* Navbar */}
      <div className="px-8 py-3">
        <div className="flex items-center justify-between rounded-full bg-white px-5 py-[10px]">
          
          <div className="text-lg font-extrabold text-[#212429]">
            LOGO
          </div>

          <div className="flex gap-2 rounded-full bg-[#EEF2F5] p-1">
            
            <NavLink
              to="/employee"
              end
              className={({ isActive }) =>
                `rounded-full px-[22px] py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[#1F4842] text-white"
                    : "bg-[#D8F3CA] text-[#212429]"
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
                    : "bg-[#D8F3CA] text-[#212429]"
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
              J
            </div>
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