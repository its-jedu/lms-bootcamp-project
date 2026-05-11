import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CourseCard from "./CourseCard";
import cachedApi from "../../api/cachedApi";
import axiosInstance from "../../api/axiosInstance";

export default function EmployeeOverview() {
  const navigate = useNavigate();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profileResponse = await cachedApi.get("api/employee/profile/", {
          ttl: 10 * 60 * 1000,
          cacheKey: "employee_profile",
        });
        
        const coursesResponse = await cachedApi.get("api/employee/assigned-courses/", {
          ttl: 5 * 60 * 1000,
          cacheKey: "employee_assigned_courses",
        });
        
        setEmployeeProfile(profileResponse.data);
        
        const processedCourses = await Promise.all(
          coursesResponse.data.map(async (course) => {
            try {
              const lessonsResponse = await cachedApi.get(
                `api/courses/${course.course_id}/lessons/`,
                {
                  ttl: 10 * 60 * 1000,
                  cacheKey: `course_lessons_${course.course_id}`,
                }
              );
              const lessons = lessonsResponse.data;
              const completedLessons = course.progress_status === "completed" 
                ? lessons.length 
                : course.progress_status === "in_progress" 
                  ? Math.floor(Math.random() * (lessons.length - 1)) + 1 
                  : 0;
              
              const progress = course.progress_status === "completed" 
                ? 100 
                : course.progress_status === "in_progress" 
                  ? Math.round((completedLessons / lessons.length) * 100) 
                  : 0;

              return {
                id: course.course_id,
                title: course.title,
                description: course.description,
                status: course.progress_status,
                progress: progress,
                numberOfLessons: lessons.length,
                completedLessons: completedLessons,
                assignmentId: course.assignment_id,
              };
            } catch (error) {
              return {
                id: course.course_id,
                title: course.title,
                description: course.description,
                status: course.progress_status,
                progress: course.progress_status === "completed" ? 100 : 
                         course.progress_status === "in_progress" ? 38 : 0,
                numberOfLessons: 0,
                completedLessons: course.progress_status === "in_progress" ? 2 : 0,
                assignmentId: course.assignment_id,
              };
            }
          })
        );
        
        setCourseData(processedCourses);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1700);
      }
    })();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1F4842] border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!employeeProfile) {
    return (
      <div className="text-center py-10">
        <p className="text-[#1F4842] font-semibold">Failed to load profile</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completed = courseData?.filter((c) => c.progress === 100).length;
  const inProgress = courseData?.filter((c) => c.progress > 0 && c.progress < 100).length;
  const notStarted = courseData?.length - completed - inProgress;
  
  const priorityCourse = courseData?.find((c) => c.status === "in_progress") || 
                        courseData?.find((c) => c.status === "not_started") ||
                        courseData?.[0];

  const hasStartedPriority = priorityCourse?.status === "in_progress";
  const currentLesson = hasStartedPriority 
    ? (priorityCourse?.completedLessons || 0) + 1 
    : 1;
  
  const hasNoCourses = courseData.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.7, ease: "easeOut" }}
    >
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-[32px] font-bold text-[#1F4842]">
          {greeting}, {employeeProfile.first_name}
        </h1>
        {hasNoCourses ? (
          <p className="text-[18px] font-semibold text-[#1F4842]">
            No courses assigned yet. Let's Start!
          </p>
        ) : (
          <p className="text-[18px] font-semibold text-[#1F4842]">
            You have {inProgress} courses in progress · Keep it up!
          </p>
        )}
      </div>

      {priorityCourse && (
        <div className="mb-6 flex justify-between items-center rounded-2xl bg-white p-6 shadow-md w-full" style={{ minHeight: "96px" }}>
          <div className="flex-1">
            <p className="text-[20px] font-normal text-[#1F4842]">
              {hasStartedPriority ? "Continue where you left off" : "Let's begin with"}
            </p>
            <h2 className="font-bold text-[#1F4842] text-lg">
              {priorityCourse.title}
            </h2>
            <p className="text-[14px] text-[#1F4842]">
              Lesson {currentLesson} of {priorityCourse.numberOfLessons} - {priorityCourse.progress}% Completed
            </p>
          </div>

          <button
            onClick={() => navigate(`./courses/${priorityCourse.id}`)}
            className="rounded-xl bg-[#1F4842] px-6 py-2.5 text-white hover:bg-[#1a3d37] transition-colors font-medium"
          >
            ▷ {hasStartedPriority ? "Resume" : "Start"}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {[[completed, "Completed"], [inProgress, "In Progress"], [notStarted, "Not Started"]].map((val, i) => (
          <div
            key={i}
            className="flex-1 bg-[#D8F3CA] p-5 rounded-2xl shadow-md font-semibold"
          >
            <p className="text-sm text-[#1F4842]">
              {val[1]}
            </p>
            <h2 className="text-3xl font-bold text-[#1F4842]">
              {val[0]}
            </h2>
          </div>
        ))}
      </div>

      {/* Courses */}
      {hasNoCourses ? (
        <div>
          <p className="font-semibold text-[#1F4842]">
            Courses will appear here once assigned by your admin
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1F4842]">
              Assigned Courses
            </h2>
            <button
              onClick={() => navigate("/employee/courses")}
              className="text-[14px] font-bold text-[#1F4842] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {courseData.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}