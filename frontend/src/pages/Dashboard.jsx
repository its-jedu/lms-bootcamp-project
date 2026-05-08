import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("all");

  const statsData = useMemo(
    () => [
      { label: "Number of Employees Enrolled", value: "3" },
      { label: "Number of Employees Completed", value: "4" },
      { label: "Number of Employees Inprogress", value: "4" },
      { label: "Number of Employees Not Started", value: "1" },
    ],
    []
  );

  const courses = useMemo(
    () => [
      {
        id: 1,
        name: "Project Management",
        status: "Draft",
        lessons: "8 Lessons",
        desc: "A project management course equips professionals with essential skills to plan,",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
      },
      {
        id: 2,
        name: "Project Management",
        status: "Published",
        lessons: "8 Lessons",
        desc: "A project management course equips professionals with essential skills to plan,",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
      },
      {
        id: 3,
        name: "Project Management",
        status: "Draft",
        lessons: "8 Lessons",
        desc: "A project management course equips professionals with essential skills to plan,",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
      },
      {
        id: 4,
        name: "Project Management",
        status: "Draft",
        lessons: "8 Lessons",
        desc: "A project management course equips professionals with essential skills to plan,",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60",
      },
    ],
    []
  );

  const handleStartCreating = () => navigate("/admin/create-course");
  const handleEditCourse = (courseId) => navigate(`/admin/create-course?edit=${courseId}`);
  const handleViewCourse = (courseId) => console.log("Viewing course:", courseId);

  return (
    <div className="flex-1 overflow-auto bg-[#f6f7f7]">
      {/* Main */}
      <div className="px-6 pb-10 pt-6">
        {/* Top content: left welcome + create card, right progress */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-900">Welcome Name!</h1>
              <p className="text-xs text-gray-600">Ready to build Course?</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#d9f99d]">
                <span className="text-xl font-bold text-[#1f4d45]">+</span>
              </div>

              <h3 className="text-center text-sm font-semibold text-gray-900">Create a Course</h3>
              <p className="mx-auto mt-2 max-w-[18rem] text-center text-xs text-gray-600">
                Use this to create <br />
                Modules and Lessons
              </p>

              <button
                onClick={handleStartCreating}
                className="mt-5 w-full rounded-xl bg-transparent py-2 text-xs font-semibold text-[#1f4d45] hover:bg-gray-50"
              >
                Start Creating
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Employee Progress</h2>
                <p className="text-xs text-gray-600">Select the course to view progress</p>
              </div>

              <div className="w-full max-w-[260px]">
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-[#efefef] px-4 py-2 pr-10 text-xs text-gray-700 outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#1f4d45]/30"
                  >
                    <option value="all">Select Course</option>
                    <option value="course1">Course 1</option>
                    <option value="course2">Course 2</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {statsData.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-[#d9f99d] p-5 shadow-sm ring-1 ring-black/5"
                >
                  <p className="text-xs font-medium text-gray-800">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue to Create Course */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Continue to Create Course</h2>
            <a href="#" className="text-xs font-semibold text-gray-700 hover:text-gray-900">
              View All
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="h-28 w-full overflow-hidden">
                  <img src={course.image} alt={course.name} className="h-full w-full object-cover" />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">Course</p>
                    <p className="text-[10px] text-gray-500">{course.lessons}</p>
                  </div>

                  <h3 className="mt-1 text-xs font-semibold text-gray-900">{course.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">
                    {course.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        course.status === "Published"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#e0e7ff] text-[#3730a3]"
                      }`}
                    >
                      {course.status}
                    </span>

                    <button
                      onClick={() => handleViewCourse(course.id)}
                      className="text-[10px] font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Go to course
                    </button>
                  </div>

                  <button
                    onClick={() => handleEditCourse(course.id)}
                    className="sr-only"
                    aria-label={`Edit ${course.name}`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Assigned Courses (header only, as visible in screenshot bottom) */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-900">Recently Assigned Courses</h2>
        </div>
      </div>
    </div>
  );
}