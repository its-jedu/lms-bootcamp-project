import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";

export default function TrackProgress() {
  const [searchEmployee, setSearchEmployee] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/course-assignments/");
      setAssignments(response.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "not_started":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "not_started":
        return "Not Started";
      default:
        return status;
    }
  };

  const filteredData = useMemo(() => {
    const q = searchEmployee.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (record) =>
        record.employee_email?.toLowerCase().includes(q)
    );
  }, [assignments, searchEmployee]);

  const handleExport = () => {
    console.log("Exporting progress report...");
    alert("Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#f3f4f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-8 h-8 border-2 border-[#0f3d3a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 animate-pulse">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#f3f4f6]">
      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[18px] font-semibold text-gray-900 animate-in fade-in slide-in-from-left-4 duration-300">
          Track Progress
        </h1>
        <p className="mt-1 text-[12px] text-gray-600 animate-in fade-in slide-in-from-left-4 duration-300 delay-100">
          Monitor employee learning progress and course completion
        </p>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-10">
        <div className="bg-white border border-gray-200 rounded-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 pt-6 pb-6">
            {/* Search and Export */}
            <div className="flex items-center justify-between mb-6 animate-in fade-in duration-300 delay-150">
              <div className="relative w-48">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                  type="text"
                  placeholder="Search email"
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40 transition-all duration-200 focus:bg-white"
                />
              </div>

              <button
                onClick={handleExport}
                className="h-8 px-6 rounded bg-[#0f3d3a] text-white text-[11px] font-medium hover:bg-[#0c312f] transition-all duration-200 hover:shadow-md active:scale-95"
              >
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto animate-in fade-in duration-300 delay-200">
              <table className="w-full border border-gray-200 text-[12px]">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Employee Email
                    </th>
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Assigned Course
                    </th>
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((record, index) => (
                    <tr
                      key={record.id}
                      className="text-gray-700 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="hover:text-[#0f3d3a] transition-colors duration-200">
                          {record.employee_email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="hover:text-[#0f3d3a] transition-colors duration-200">
                          {record.course_title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-[11px] font-medium transition-all duration-300 hover:scale-105 ${getStatusBadge(
                            record.progress_status
                          )}`}
                        >
                          {formatStatus(record.progress_status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-6 text-center text-gray-500 border-b border-gray-200 animate-in fade-in duration-300"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 animate-in zoom-in-50 duration-300">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>No assignments found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}