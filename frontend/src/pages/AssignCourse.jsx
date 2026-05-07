import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AssignCourse() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectedCourses, setSelectedCourses] = useState(new Set());

  // success modal
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const employees = [
    {
      id: 1,
      name: "name",
      email: "name@example.com",
      department: "HR",
      group: "Recruitment",
      assigned: [],
    },
  ];

  const courses = [
    { id: 1, name: "Course Name", status: "Published" },
    { id: 2, name: "Course Name", status: "Published" },
  ];

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

  const handleAssign = () => {
    if (selectedEmployees.size === 0 || selectedCourses.size === 0) {
      alert("Please select at least one employee and one course");
      return;
    }

    // Build message like screenshot
    const courseName =
      courses.find((c) => selectedCourses.has(c.id))?.name ?? "Course";
    const empCount = selectedEmployees.size;

    setSuccessMessage(
      `Course | ${courseName} | has been successfully assigned to ${empCount} Employees (Groups, Departments)`
    );
    setSuccessOpen(true);

    // reset selections
    setSelectedEmployees(new Set());
    setSelectedCourses(new Set());
  };

  const handleCancel = () => navigate(-1);

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  return (
    <div className="flex-1 overflow-auto bg-[#f3f4f6] relative">
      {/* Success modal overlay */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* dim background */}
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setSuccessOpen(false)}
          />

          {/* modal */}
          <div className="relative z-10 w-[420px] max-w-[92vw] rounded-xl bg-[#0f3d3a] px-8 py-7 shadow-xl">
            {/* close */}
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="absolute right-4 top-4 text-white/80 hover:text-white text-sm"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {/* big check */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-transparent flex items-center justify-center">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
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

            <div className="mt-2 text-center">
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
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        >
          <span className="text-base leading-none">‹</span>
          Back
        </button>
      </div>

      {/* Center panel */}
      <div className="px-8 pb-10 pt-4">
        <div className="mx-auto w-full max-w-3xl bg-white border border-gray-200 rounded-md">
          <div className="px-10 pt-8 pb-6">
            <h1 className="text-[15px] font-semibold text-gray-900">
              Assign Course
            </h1>
            <p className="mt-1 text-[11px] text-gray-500">
              Assign courses and add, remove or edit employees as needed
            </p>

            {/* Select Employees */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-gray-900">
                    Select Employees
                  </h2>
                  <p className="mt-1 text-[11px] text-gray-500">
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
                    className="w-full h-8 pl-7 pr-2 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40"
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
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="text-gray-700">
                        <td className="w-10 px-2 py-2 border-b border-gray-200">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded"
                            checked={selectedEmployees.has(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </td>
                        <td className="px-3 py-2 border-b border-gray-200 w-1/2">
                          {emp.name}
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
                          className="px-3 py-6 text-center text-gray-500 border-b border-gray-200"
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
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-gray-900">
                    Select Course
                  </h2>
                  <p className="mt-1 text-[11px] text-gray-500">
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
                    className="w-full h-8 pl-7 pr-2 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center justify-between gap-3 text-[11px]"
                  >
                    <span className="flex items-center gap-2 text-gray-800">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded"
                        checked={selectedCourses.has(course.id)}
                        onChange={() => toggleCourse(course.id)}
                      />
                      {course.name}
                    </span>

                    <span className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium">
                      Published
                    </span>
                  </label>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="text-[11px] text-gray-500">No courses found</div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-12 flex justify-end gap-3 pb-2">
              <button
                onClick={handleCancel}
                className="h-8 px-6 rounded border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="h-8 px-6 rounded bg-[#0f3d3a] text-white text-[11px] hover:bg-[#0c312f]"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}