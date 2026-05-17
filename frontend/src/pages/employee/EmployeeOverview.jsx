import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import CourseCard from "./CourseCard";
import cachedApi from "../../api/cachedApi";
import env from "../../config/env";

export default function EmployeeOverview() {
  const navigate = useNavigate();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedCourses = async () => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${env.API_URL}/api/employee/assigned-courses/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assigned courses.");
    }

    const data = await response.json();

    const processedCourses = data.map((course) => ({
      id: course.course_id,
      title: course.title,
      description: course.description,
      status: course.progress_status,
      progress: course.progress_percentage,
      numberOfLessons: course.total_lessons,
      completedLessons: course.done_lessons,
      assignmentId: course.assignment_id,
      assignedAt: course.assigned_at,
      startedAt: course.started_at,
      updatedAt: course.completed_at || course.started_at || course.assigned_at,
    }));

    setCourseData(processedCourses);
  };

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const profileCacheKey = `employee_profile_${user.id || user.email}`;
        const profileResponse = await cachedApi.get("api/employee/profile/", {
          ttl: 10 * 60 * 1000,
          cacheKey: profileCacheKey,
        });

        setEmployeeProfile(profileResponse.data);
        await fetchAssignedCourses();
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

  const completed = courseData?.filter((c) => c.status === "completed").length || 0;
  const inProgress = courseData?.filter((c) => c.status === "in_progress").length || 0;
  const notStarted = courseData?.filter((c) => c.status === "not_started").length || 0;

  const priorityCourse =
    courseData?.find((c) => c.status === "in_progress") ||
    courseData?.find((c) => c.status === "not_started") ||
    courseData?.find((c) => c.status === "completed") ||
    courseData?.[0];

  const hasStartedPriority = priorityCourse?.status === "in_progress";

  const currentLesson =
    priorityCourse?.status === "completed"
      ? priorityCourse.numberOfLessons || 1
      : hasStartedPriority
        ? Math.min(
            (priorityCourse?.completedLessons || 0) + 1,
            priorityCourse?.numberOfLessons || 1
          )
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
        <div
          className="mb-6 flex justify-between items-center rounded-2xl bg-white p-6 shadow-md w-full"
          style={{ minHeight: "96px" }}
        >
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
            onClick={() => navigate(`/employee/courses/${priorityCourse.id}`)}
            className="rounded-xl bg-[#1F4842] px-6 py-2.5 text-white hover:bg-[#1a3d37] transition-colors font-medium flex items-center gap-2"
          >
            {hasStartedPriority ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
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