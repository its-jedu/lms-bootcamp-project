import { useState } from "react";

export default function Analytics() {
  const [downloadingReport, setDownloadingReport] = useState(null);

  const analyticsData = [
    { label: "Total Employees", value: "150", trend: "+12%" },
    { label: "Active Courses", value: "25", trend: "+5%" },
    { label: "Completion Rate", value: "87%", trend: "+8%" },
    { label: "Avg. Time to Complete", value: "14 days", trend: "-2 days" },
  ];

  const topCourses = [
    { name: "Leadership Development", completed: 120, inProgress: 20, notStarted: 10 },
    { name: "Technical Skills", completed: 95, inProgress: 35, notStarted: 20 },
    { name: "Communication", completed: 110, inProgress: 25, notStarted: 15 },
  ];

  const handleDownloadReport = (reportType) => {
    setDownloadingReport(reportType);
    console.log(`Downloading ${reportType} report...`);
    
    // Simulate download
    setTimeout(() => {
      alert(`${reportType} report downloaded successfully!`);
      setDownloadingReport(null);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics</h1>
        <p className="text-gray-600 text-sm">View learning and performance analytics</p>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-600 text-xs font-medium mb-2 uppercase">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-green-600 text-sm font-semibold">{metric.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Courses by Enrollment */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Courses by Enrollment</h2>

          <div className="space-y-8">
            {topCourses.map((course, idx) => (
              <div key={idx}>
                <h3 className="font-medium text-gray-900 text-sm mb-4">{course.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2">Completed</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 bg-green-500 rounded-full"
                          style={{ width: `${(course.completed / (course.completed + course.inProgress + course.notStarted)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-12">{course.completed}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2">In Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 bg-blue-500 rounded-full"
                          style={{ width: `${(course.inProgress / (course.completed + course.inProgress + course.notStarted)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-12">{course.inProgress}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-2">Not Started</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 bg-gray-400 rounded-full"
                          style={{ width: `${(course.notStarted / (course.completed + course.inProgress + course.notStarted)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-12">{course.notStarted}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Reports */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleDownloadReport("Employee Performance")}
              disabled={downloadingReport !== null}
              className="p-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
            >
              <p className="font-semibold text-gray-900 text-sm mb-1">Employee Performance</p>
              <p className="text-sm text-gray-600">{downloadingReport === "Employee Performance" ? "Downloading..." : "Download detailed report"}</p>
            </button>
            <button 
              onClick={() => handleDownloadReport("Course Completion")}
              disabled={downloadingReport !== null}
              className="p-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
            >
              <p className="font-semibold text-gray-900 text-sm mb-1">Course Completion</p>
              <p className="text-sm text-gray-600">{downloadingReport === "Course Completion" ? "Downloading..." : "Download completion data"}</p>
            </button>
            <button 
              onClick={() => handleDownloadReport("Time Analysis")}
              disabled={downloadingReport !== null}
              className="p-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
            >
              <p className="font-semibold text-gray-900 text-sm mb-1">Time Analysis</p>
              <p className="text-sm text-gray-600">{downloadingReport === "Time Analysis" ? "Downloading..." : "Download time insights"}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
