import { useNavigate } from "react-router-dom";



export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const isNotStarted = course.status === "not_started";

  return (
   <div className="bg-white rounded-xl p-4 w-[260px] shadow-sm border border-gray-100 flex-shrink-0">
  
  <div className="flex justify-between items-start mb-1">
    <p className="text-[10px] text-gray-400">Course</p>
    <p className="text-[10px] text-[#1F4842]">{course.numberOfLessons} Lessons</p>
  </div>

  <h3 className="text-sm font-semibold text-[#1F4842] mb-1">
    {course.title}
  </h3>

  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
    {course.description}
  </p>

  <div className="h-1.5 bg-[#D8F3CA] rounded-full overflow-hidden mb-2">
    <div
      className="h-full bg-[#1F4842] rounded-full"
      style={{ width: `${course.progress}%` }}
    />
  </div>

  <div className="flex justify-between items-center mb-3">
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full ${
        isNotStarted
          ? "bg-yellow-100 text-yellow-600"
          : "bg-blue-100 text-blue-600"
      }`}
    >
      {isNotStarted ? "Not Started" : "In progress"}
    </span>

    <span className="text-[10px] text-[#1F4842]">
      {course.progress}%
    </span>
  </div>

  <button className="w-full rounded-full bg-[#D8F3CA] py-2 text-xs text-[#006064] font-medium"
   onClick={() => navigate("/employee/EmployeeLesson")}
  >
    {isNotStarted ? "Start" : "Resume"}
  </button>
</div>
  );
}