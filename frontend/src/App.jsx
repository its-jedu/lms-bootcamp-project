import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/CreateCourse";
import ManageEmployees from "./pages/ManageEmployees";
import AssignCourse from "./pages/AssignCourse";
import TrackProgress from "./pages/TrackProgress";
import Analytics from "./pages/Analytics";

// Employee
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import EmployeeCourses from "./pages/employee/EmployeeCourses";
import EmployeeOverview from "./pages/employee/EmployeeOverview";
import { courseData } from "./pages/employee/courseData.js";
import EmployeeLesson from "./pages/employee/EmployeeLesson";

// Layouts & Error
import AdminLayout from "./layout/AdminLayout";

function App() {
  const [courses, setCourses] = useState([...courseData]);
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
          <Route path="assign-course" element={<AssignCourse />} />
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="track-progress" element={<TrackProgress />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="employee"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeOverview courseData={courses} setCourseData={setCourses} />} />
          <Route path="courses" element={<><Outlet /></>} >
            <Route index element={<EmployeeCourses courseData={courses} setCourseData={setCourses} />} />
            <Route path=":courseId" element={<EmployeeLesson courseData={courses} setCourseData={setCourses} />} />
          </Route>
          
        </Route>

      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;