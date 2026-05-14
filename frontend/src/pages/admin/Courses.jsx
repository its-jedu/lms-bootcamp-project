import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("api/courses");
        setCourses(await response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handlePublishCourse = async (courseId) => {
    try {
      await axiosInstance.post(`/courses/${courseId}/publish`);
      // Update the course status in the UI
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: "published" } : course,
        ),
      );
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };
  if (!courses) {
    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7] flex items-center justify-center">
        <p className="text-[11px] text-[#999999]">Loading....</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7] flex items-center justify-center">
        <p className="text-[11px] text-[#999999]">No courses available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e5e5] mt-6">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-[#ececec]">
        <h2 className="text-[32px] font-bold text-[#1f4842]">Course</h2>

        <p className="text-[11px] text-[#7d7d7d] mt-[4px]">
          view all your draft and published courses
        </p>
      </div>

      {/* TABLE */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#ececec]">
            <th className="text-left px-5 py-3 text-[11px] font-medium text-[#666666]">
              Course Title
            </th>

            <th className="text-left px-5 py-3 text-[11px] font-medium text-[#666666]">
              Status
            </th>

            <th className="text-left px-5 py-3 text-[11px] font-medium text-[#666666]">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-5 py-6 text-center text-[11px] text-[#999999]"
              >
                No courses yet
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.id} className="border-b border-[#f1f1f1]">
                <td className="px-5 py-4 text-[11px] text-[#444444]">
                  {course.title}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`text-[10px] px-2 py-[3px] rounded-full ${
                      course.status === "published"
                        ? "bg-[#d8f0d9] text-[#397b45]"
                        : "bg-[#e5ebff] text-[#5f6ea7]"
                    }`}
                  >
                    {course.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {course.status === "draft" && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/admin/courses/${course.id}/edit`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-4 h-[28px] rounded-[4px] mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePublishCourse(course.id)}
                        className="bg-[#1f4842] hover:bg-[#173a35] text-white text-[10px] px-4 h-[28px] rounded-[4px]"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/courses/${course.id}/delete`)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-4 h-[28px] rounded-[4px] mr-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {course.status === "published" && (
                    <button className="bg-[#e5ebff] hover:bg-[#d0d9ff] text-[#5f6ea7] text-[10px] px-4 h-[28px] rounded-[4px]">
                      View course
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Courses;
