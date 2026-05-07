import { useState } from "react";

export default function TrackProgress() {
  const [searchEmployee, setSearchEmployee] = useState("");

  const progressData = [
    {
      id: 1,
      employeeName: "name",
      course: "Course name",
      status: "In Progress",
    },
    {
      id: 2,
      employeeName: "name",
      course: "Course name",
      status: "Completed",
    },
    {
      id: 3,
      employeeName: "name",
      course: "Course name",
      status: "Not Started",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Not Started":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredData = progressData.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchEmployee.toLowerCase());
    return matchesSearch;
  });

  const handleExport = () => {
    console.log("Exporting progress report...");
    alert("Report exported successfully!");
  };

  return (
    <div className="flex-1 overflow-auto bg-[#f3f4f6]">
      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[18px] font-semibold text-gray-900">
          Track Progress
        </h1>
        <p className="mt-1 text-[12px] text-gray-600">
          Monitor employee learning progress and course completion
        </p>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-10">
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-8 pt-6 pb-6">
            {/* Search and Export */}
            <div className="flex items-center justify-between mb-6">
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
                  placeholder="Search name"
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40"
                />
              </div>

              <button
                onClick={handleExport}
                className="h-8 px-6 rounded bg-[#0f3d3a] text-white text-[11px] font-medium hover:bg-[#0c312f]"
              >
                Export
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-[12px]">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Employee Name
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
                  {filteredData.map((record) => (
                    <tr
                      key={record.id}
                      className="text-gray-700 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{record.employeeName}</td>
                      <td className="px-6 py-4">{record.course}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-[11px] font-medium ${getStatusBadge(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-6 text-center text-gray-500 border-b border-gray-200"
                      >
                        No employees found
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