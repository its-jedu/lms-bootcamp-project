import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";

function LastCourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
      <h3 className="text-lg font-bold text-[#1F4842] mb-3">
        {course.title}
      </h3>

      <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-4">
        {course.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {course.tags?.map((tag, index) => (
          <span
            key={index}
            className="text-xs text-[#1F4842] border border-[#1F4842] rounded-full px-4 py-1"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-1 text-xs text-[#1F4842]">
          <p>◷ Last updated {course.dateCreated ?? course.updatedAt}</p>
          <p>CC Closed captions</p>
          <p>▤ {course.numberOfLessons ?? course.articles} lessons</p>
        </div>

        <button
          className="bg-[#1F4842] text-white text-xs rounded-md px-6 py-3"
          onClick={() => navigate("/employee/EmployeeLesson")}
        >
          ▷ {course.progress === 0 ? "Start" : "Resume"}
        </button>
      </div>
    </div>
  );
}


export default function EmployeeCourses({ courseData = [] }) {
  const navigate = useNavigate();
  const featuredCourse = courseData[0] || null;
  const lastCourses = courseData.slice(0, 2);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-[#1F4842]">My Courses</h1>
      
     
      {featuredCourse && (
        <div className="mb-6 flex justify-between rounded-2xl bg-white p-6 shadow-md">
          <div>
            <h2 className="font-bold text-[#1F4842]">{featuredCourse.title}</h2>
            <p className="text-sm text-gray-500">{featuredCourse.progress}% complete</p>
          </div>

          <button
            className="rounded-xl bg-[#1F4842] px-5 py-2 text-white"
            onClick={() => navigate("/employee/EmployeeLesson")}
          >
            ▷ {featuredCourse.progress === 0 ? "Start" : "Resume"}
          </button>
        </div>
      )}
      
        {lastCourses.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-[#1F4842] mb-4">
              Last Course
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {lastCourses.map((course, index) => (
                <LastCourseCard key={index} course={course} />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1F4842]">
              Assigned Courses
            </h2>
            <button className="text-xs font-semibold text-[#1F4842]">
              View All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {courseData.map((c, index) => (
              <CourseCard key={index} course={c} />
            ))}
          </div>
        </>
      )}
    </>
  );
}