import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import ManageEmployees from "./pages/ManageEmployees";
import TrackProgress from "./pages/TrackProgress";
import Analytics from "./pages/Analytics";

// Employee
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeOverview from "./pages/EmployeeOverview";

// Layouts & Error
import AdminLayout from "./layout/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<><Outlet /></>} errorElement={<ErrorBoundary />}>
        
        {/* Public Route */}
        <Route index element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminLayout/>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="track-progress" element={<TrackProgress />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="employee"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeOverview />} />
        </Route>

      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;