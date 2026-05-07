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
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import EmployeeCourses from "./pages/employee/EmployeeCourses";
import EmployeeOverview from "./pages/employee/EmployeeOverview"
import {courseData} from "./pages/employee/courseData.js"

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Login /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "employee",
        element: (
          <ProtectedRoute allowRoles={["employee"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <EmployeeOverview courseData={courseData} /> },
          { path: "courses", element: <EmployeeCourses courseData={courseData} /> },
        ]
      }
    ]
  }
]);

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
           <Route path="assign-course" element={<AssignCourse />} />
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