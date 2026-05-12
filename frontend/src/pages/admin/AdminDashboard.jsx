import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/auth/useAuth";
import axiosInstance from "@/api/axiosInstance";
import { Plus } from "lucide-react";

export default function AdminDashboard() {
  let content;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await axiosInstance.get("api/courses/");
        const data = await response.data;
        if (response.status === 200) {
          const coursesWithLessons = await Promise.all(
            data.map(async (course) => {
              try {
                const lessonsRes = await axiosInstance.get(
                  `api/courses/${course.id}/lessons/`
                );
                return {
                  ...course,
                  lessonCount: lessonsRes.data.length,
                };
              } catch {
                return {
                  ...course,
                  lessonCount: 0,
                };
              }
            })
          );
          setCourses(coursesWithLessons);
        } else {
          console.error("Failed to fetch courses:", data.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleViewCourse = (courseId) => navigate(`../create-course?edit=${courseId}`);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1f4842] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#1f4842]">Loading...</p>
        </div>
      </div>
    );
  }

  if (courses) {
    if (courses.length === 0) {
      content = (
        <div className="mt-8">
          <h2 className="text-[32px] font-bold text-[#1f4842]">
            No courses created yet!
          </h2>
        </div>
      );
    } else {
      const draftCourses = courses.filter((course) => course.status.toLowerCase() === "draft");
      
      content = (
        <div className="mt-8">
          {draftCourses.length > 0 && (
            <>
              <div className="mb-4">
                <h2 className="text-[32px] font-bold text-[#1f4842]">
                  Continue to Create Course
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                {draftCourses.map((course) => (
                  <div
                    key={course.id}
                    className="w-[312px] h-[203px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-500">Course</p>
                        <p className="text-[10px] text-gray-500">
                          {course.lessonCount} {course.lessonCount === 1 ? "Lesson" : "Lessons"}
                        </p>
                      </div>

                      <h3 className="mt-1 text-[24px] font-bold text-[#1f4842]">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500 flex-1">
                        {course.description}
                      </p>

                      <div className="mt-3 flex flex-col items-stretch justify-between">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold self-start ${
                            course.status === "published"
                              ? "bg-[#dcfce7] text-[#166534]"
                              : "bg-[#e0e7ff] text-[#3730a3]"
                          }`}
                        >
                          {course.status === "published" ? "Published" : "Draft"}
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
                        onClick={() => handleViewCourse(course.id)}
                        className="sr-only"
                        aria-label={`Edit ${course.title}`}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto bg-[#f6f7f7]">
        {/* Main */}
        <div className="px-6 pb-10 pt-6">
          {/* Top content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="lg:col-span-4">
              <div className="mb-6">
                <h1 className="text-[32px] font-bold text-[#1f4842]">
                  Welcome {user.role}!
                </h1>
                <p className="text-[24px] font-normal text-[#1f4842]">Ready to build Course?</p>
              </div>

              <div className="w-[312px] h-[308px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <div className="p-4 flex flex-col items-center justify-center h-full">
                  <Link to="../create-course" className="mb-4">
                    <div className="w-[70px] h-[70px] rounded-full bg-[#B8F699] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#1f4842] flex items-center justify-center">
                        <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  </Link>

                  <h3 className="text-center text-sm font-semibold text-gray-900">
                    Create a Course
                  </h3>
                  <p className="mt-2 text-center text-base text-[#1f4842] max-w-[14rem]">
                    Use this to create course by adding lessons and content
                  </p>
                </div>
              </div>
            </div>
          </div>
          {content}
        </div>
      </div>
    );
  }
}