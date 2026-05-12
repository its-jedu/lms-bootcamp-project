import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

export default function AssignCourse() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedCourses, setSelectedCourses] = useState(new Set());

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesRes, coursesRes] = await Promise.all([
        axiosInstance.get("/api/admin/employees/list/"),
        axiosInstance.get("/api/courses/"),
      ]);

      setEmployees(employeesRes.data);
      setCourses(coursesRes.data.filter((course) => course.status === "published"));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleEmployee = (id) => {
    const next = new Set(selectedEmployees);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedEmployees(next);
  };

  const toggleCourse = (id) => {
    const next = new Set(selectedCourses);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedCourses(next);
  };

  const handleAssign = async () => {
    if (selectedEmployees.size === 0 || selectedCourses.size === 0) {
      alert("Please select at least one employee and one course");
      return;
    }

    setAssigning(true);

    try {
      const payload = {
        employee_ids: Array.from(selectedEmployees),
        course_ids: Array.from(selectedCourses),
      };

      const response = await axiosInstance.post("/api/admin/course-assignments/", payload);

      const assignedCourses = courses
        .filter((c) => selectedCourses.has(c.id))
        .map((c) => c.title)
        .join(", ");
      const empCount = selectedEmployees.size;

      setSuccessMessage(
        `Course | ${assignedCourses} | has been successfully assigned to ${empCount} Employee${empCount > 1 ? "s" : ""}`
      );
      setSuccessOpen(true);

      setSelectedEmployees(new Set());
      setSelectedCourses(new Set());
    } catch (error) {
      console.error("Error assigning course:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data) {
        const data = error.response.data;
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          alert(firstError[0]);
        } else if (typeof firstError === "string") {
          alert(firstError);
        } else {
          alert(JSON.stringify(data));
        }
      } else if (error.response?.status === 404) {
        alert("Course assignment endpoint not found. Please check the API URL configuration.");
      } else {
        alert("Failed to assign course. Please try again.");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = () => navigate(-1);

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (emp) =>
        emp.first_name?.toLowerCase().includes(q) ||
        emp.last_name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title?.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#f3f4f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0f3d3a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#f3f4f6] relative">
      {/* Success modal overlay */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* dim background */}
          <div
            className="absolute inset-0 bg-black/10 animate-in fade-in duration-200"
            onClick={() => setSuccessOpen(false)}
          />

          {/* modal */}
          <div className="relative z-10 w-[420px] max-w-[92vw] rounded-xl bg-[#0f3d3a] px-8 py-7 shadow-xl animate-in zoom-in-95 duration-300">
            {/* close */}
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="absolute right-4 top-4 text-white/80 hover:text-white text-sm transition-colors duration-200"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {/* big check */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-transparent flex items-center justify-center animate-in zoom-in-50 duration-500">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white animate-in spin-in-3 duration-500"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-2 text-center animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-white text-[22px] font-semibold">Success!</div>
              <p className="mt-2 text-white/85 text-[11px] leading-4">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top back */}
      <div className="px-8 pt-6">
        <button
          onClick={handleCancel}
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 transition-colors duration-200 hover:gap-3"
        >
          <span className="text-base leading-none transition-transform duration-200 group-hover:-translate-x-1">‹</span>
          Back
        </button>
      </div>

      {/* Center panel */}
      <div className="px-8 pb-10 pt-4">
        <div className="mx-auto w-full max-w-3xl bg-white border border-gray-200 rounded-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-10 pt-8 pb-6">
            <h1 className="text-[32px] font-bold text-[#1F4842] animate-in fade-in slide-in-from-left-2 duration-300">
              Assign Course
            </h1>
            <p className="mt-1 text-[16px] font-normal text-[#1F4842] animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
              Assign courses and add, remove or edit employees as needed
            </p>

            {/* Select Employees */}
            <div className="mt-6 animate-in fade-in duration-300 delay-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[32px] font-bold text-[#1F4842]">
                    Select Employees
                  </h2>
                  <p className="mt-1 text-[16px] font-normal text-[#1F4842]">
                    Select one or more employees to assign the course
                  </p>
                </div>
                <div className="relative w-44">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M16.5 16.5 21 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                    className="w-full h-8 pl-7 pr-2 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40 transition-all duration-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border border-gray-200 text-[11px]">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-600">
                      <th className="w-10 px-2 py-2 border-b border-gray-200">
                        <input type="checkbox" className="h-3 w-3 rounded" />
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b border-gray-200 w-1/2">
                        Employee Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
                        Employee Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <tr
                        key={emp.id}
                        className="text-gray-700 hover:bg-gray-50 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="w-10 px-2 py-2 border-b border-gray-200">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded cursor-pointer"
                            checked={selectedEmployees.has(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </td>
                        <td className="px-3 py-2 border-b border-gray-200 w-1/2">
                          {emp.first_name} {emp.last_name}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-200">
                          {emp.email}
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-6 text-center text-gray-500 border-b border-gray-200 animate-in fade-in duration-300"
                        >
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Select Course */}
            <div className="mt-10 animate-in fade-in duration-300 delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[32px] font-bold text-[#1F4842]">
                    Select Course
                  </h2>
                  <p className="mt-1 text-[16px] font-normal text-[#1F4842]">
                    Select Course to assign the course
                  </p>
                </div>
                <div className="relative w-44">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M16.5 16.5 21 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full h-8 pl-7 pr-2 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40 transition-all duration-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredCourses.map((course, index) => (
                  <label
                    key={course.id}
                    className="flex items-center justify-between gap-3 text-[11px] cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors duration-150 animate-in fade-in slide-in-from-right-2 duration-300"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <span className="flex items-center gap-2 text-gray-800">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded cursor-pointer"
                        checked={selectedCourses.has(course.id)}
                        onChange={() => toggleCourse(course.id)}
                      />
                      {course.title}
                    </span>

                    <span className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium transition-all duration-200 hover:scale-105">
                      Published
                    </span>
                  </label>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="text-[11px] text-gray-500 animate-in fade-in duration-300">
                    No courses found
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-12 flex justify-end gap-3 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
              <button
                onClick={handleCancel}
                className="h-8 px-6 rounded border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="h-8 px-6 rounded bg-[#0f3d3a] text-white text-[11px] hover:bg-[#0c312f] transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {assigning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}