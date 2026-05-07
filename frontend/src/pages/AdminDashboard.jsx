import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/auth/useAuth";
import axiosInstance from "@/api/axiosInstance";

export default function AdminDashboard() {
  let content;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axiosInstance.get("/api/courses/");
        const data = response.data;
        if (response.status === 200) {
          setCourses(data);
        } else {
          console.error("Failed to fetch courses:", data.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
    fetchCourses();
  }, []);

  const handleEditCourse = (courseId) =>
    navigate(`../create-course?edit=${courseId}`);
  const handleViewCourse = (courseId) =>
    console.log("Viewing course:", courseId);

  if (courses) {
    if (courses.length === 0) {
      content = (
        <div className="text-left text-gray-500 p-4 mt-8">
          No courses found. Start by creating a new course!
        </div>
      );
    } else {
      content = (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Continue to Create Course
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {courses.filter((course) => course.status === "Draft").map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">Course</p>
                    <p className="text-[10px] text-gray-500">
                      {course.lessons}
                    </p>
                  </div>

                  <h3 className="mt-1 text-xs font-semibold text-gray-900">
                    {course.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">
                    {course.desc}
                  </p>

                  <div className="mt-3 flex flex-col items-stretch justify-between">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold self-start ${
                        course.status === "Published"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#e0e7ff] text-[#3730a3]"
                      }`}
                    >
                      {course.status}
                    </span>

                    <div className="flex">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 bg-[#b8f699] rounded-full w-full py-1 mt-2"
                      >
                        Go to course
                      </button>
                    </div>
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
      );
    }

    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7]">
        {/* Main */}
        <div className="px-6 pb-10 pt-6">
          {/* Top content: left welcome + create card, right progress */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="lg:col-span-4">
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome {user.role}!
                </h1>
                <p className="text-xs text-gray-600">Ready to build Course?</p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <Link to="../create-course">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#d9f99d]">
                  <span className="text-xl font-bold text-[#1f4d45]">+</span>
                </div>
              </Link>

                <h3 className="text-center text-sm font-semibold text-gray-900">
                  Create a Course
                </h3>
                <p className="mx-auto mt-2 max-w-[18rem] text-center text-xs text-gray-600">
                  Use this to create <br />
                  Modules and Lessons
                </p>
              </div>
            </div>
          </div>
          {content}
        </div>
      </div>
    );
  }
}
