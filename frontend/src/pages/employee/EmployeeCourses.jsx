import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BookOpen, Play, RotateCcw } from "lucide-react";
import CourseCard from "./CourseCard";
import cachedApi from "../../api/cachedApi";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function LastCourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 flex flex-col justify-between" style={{ width: "630px", height: "306px" }}>
      <div>
        <h3 className="text-lg font-bold text-[#1F4842] mb-3">
          {course.title}
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-4">
          {course.description}
        </p>
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-2 text-xs text-[#1F4842]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Last updated {formatDate(course.updatedAt || course.assigned_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.numberOfLessons} lessons</span>
          </div>
        </div>

        <button
          className="bg-[#1F4842] text-white text-xs rounded-md px-6 py-3 hover:bg-[#1a3d37] transition-colors flex items-center gap-1.5"
          onClick={() => navigate(`/employee/courses/${course.id}`)}
        >
          {course.progress === 0 ? (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Start</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}


export default function EmployeeCourses() {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const coursesResponse = await cachedApi.get("api/employee/assigned-courses/", {
          ttl: 5 * 60 * 1000,
          cacheKey: "employee_assigned_courses",
        });
        
        // Process courses with enhanced data
        const processedCourses = coursesResponse.data.map((course) => ({
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
      } catch (error) {
        console.error("Failed to fetch courses:", error);
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

  const priorityCourse = courseData?.find((c) => c.status === "in_progress") || 
                        courseData?.find((c) => c.status === "not_started") ||
                        courseData?.[0];

  const hasStartedPriority = priorityCourse?.status === "in_progress";
  const currentLesson = hasStartedPriority 
    ? (priorityCourse?.completedLessons || 0) + 1 
    : 1;

  const lastCourses = courseData.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.7, ease: "easeOut" }}
    >
      <div className="mb-5">
        <h1 className="text-[32px] font-bold text-[#1F4842]">My Courses</h1>
        <p className="text-[18px] font-semibold text-[#1F4842]">
          {courseData.length} {courseData.length === 1 ? 'course' : 'courses'} assigned
        </p>
      </div>
      
      {priorityCourse && (
        <div className="mb-6 flex justify-between items-center rounded-2xl bg-white p-6 shadow-md w-full" style={{ minHeight: "96px" }}>
          <div className="flex-1">
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
      
      {lastCourses.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-[#1F4842] mb-4 mt-8">
            Last Course{lastCourses.length > 1 ? 's' : ''}
          </h2>

          <div className="flex gap-4 mb-8" style={{ width: "1280px", height: "306px" }}>
            {lastCourses.map((course) => (
              <LastCourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}

      {courseData.length === 0 ? (
        <div>
          <p className="font-semibold text-[#1F4842]">
            Courses will appear here once assigned by your admin
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-xl font-bold text-[#1F4842]">
              Assigned Courses
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {courseData.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}