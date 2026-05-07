import AdminTopNav from "../components/AdminTopNav";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <AdminTopNav />

      {/* Content area fills remaining height and allows scrolling */}
      <main className="flex-1 min-h-0 w-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}