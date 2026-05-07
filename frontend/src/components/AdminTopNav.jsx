import { NavLink, replace, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuth from "@/auth/useAuth";

export default function AdminTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user, accessToken } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const menuItems = [
    { name: "Dashboard", path: "./dashboard" },
    { name: "Create Course", path: "./create-course" },
    { name: "Manage Employees", path: "./manage-employees" },
    { name: "Track Progress", path: "./track-progress" },
  ];

  const isActive = (path) => location.pathname === path;

  const basePill =
    "rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-colors whitespace-nowrap";
  const activePill = "bg-[#1f4d45] text-white";
  const inactivePill = "bg-[#b9f27c] text-[#1f4d45] hover:brightness-95";

  // Close dropdown on outside click + ESC
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    if (!isAuthenticated && !user && !accessToken) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="bg-white border-gray-300 rounded-full shadow-sm mx-2">
      <div className="flex justify-evenly py-3 px-4 items-center mt-1">
        {/* Left: brand */}
        <div className="flex">
          <div className="bg-white">
            <span className="text-lg font-semibold text-gray-800">
              <span className="font-bold">Skill</span>minds
            </span>
          </div>
        </div>

        {/* Middle: centered pills */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${basePill} ${isActive(item.path) ? activePill : inactivePill}`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: icons + avatar dropdown */}
        <div className="ml-auto flex items-center gap-3">
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

          {/* Avatar button + dropdown */}
          <div className="relative z-50" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {/* user icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="#111827"
                  strokeWidth="2"
                />
                <path
                  d="M20 21a8 8 0 1 0-16 0"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10"
              >
                <button
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/admin/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setOpen(false);
                    navigate("/admin/settings");
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
    </div>
  );
}
