import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("api/courses/");
        setCourses(await response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handlePublishCourse = async (courseId) => {
    try {
      await axiosInstance.patch(`api/courses/${courseId}/publish/`);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: "published" } : course,
        ),
      );
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7] flex items-center justify-center">
        <p className="text-[11px] text-[#999999]">Loading....</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#f6f7f7]">
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[32px] font-bold text-[#1F4842]">Course</h1>
        <p className="mt-1 text-[16px] text-[#1F4842]">
          View and manage all your draft and published courses
        </p>
      </div>

      <div className="px-8 pb-10">
        <div className="bg-white border border-gray-200 rounded-md">
          <div className="px-8 pt-6 pb-6">
            {/* Search and Create Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-96">
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
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-[11px] rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600/40 transition-all duration-200 focus:bg-white"
                />
              </div>

              <button
                onClick={() => navigate("./create-course")}
                className="h-8 px-6 rounded bg-[#0f3d3a] text-white text-[11px] font-medium hover:bg-[#0c312f] transition-all duration-200 hover:shadow-md active:scale-95"
              >
                + Create New Course
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-[12px]">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-medium border-b border-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="text-gray-700 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-[12px]">
                        {course.title}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                            course.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {course.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {course.status === "draft" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePublishCourse(course.id)}
                              className="h-8 px-4 rounded bg-[#0f3d3a] text-white text-[11px] font-medium hover:bg-[#0c312f] transition-all duration-200 hover:shadow-md active:scale-95"
                            >
                              Publish Course
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === course.id ? null : course.id);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              {openDropdownId === course.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-in fade-in zoom-in-95 duration-200">
                                  <button
                                    onClick={() => {
                                      navigate(`./create-course/?edit=${course.id}`);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      axiosInstance
                                        .delete(`api/courses/${course.id}/`)
                                        .then(() => {
                                          setCourses((prevCourses) =>
                                            prevCourses.filter((c) => c.id !== course.id),
                                          );
                                          setOpenDropdownId(null);
                                        });
                                    }}
                                    className="w-full px-4 py-2 text-left text-[11px] text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {course.status === "published" && (
                          <button
                            onClick={() => navigate(`./create-course/?edit=${course.id}`)}
                            className="h-8 px-4 rounded bg-blue-50 text-blue-700 text-[11px] font-medium hover:bg-blue-100 transition-all duration-200"
                          >
                            View Course
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-6 text-center text-gray-500 border-b border-gray-200">
                        <div className="flex flex-col items-center gap-2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-300"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>No courses available.</span>
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

export default Courses;