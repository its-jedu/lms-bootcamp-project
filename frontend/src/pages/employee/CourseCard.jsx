import { useNavigate } from "react-router-dom";
import { Play, RotateCcw, Eye } from "lucide-react";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const isNotStarted = course.status === "not_started";
  const isCompleted = course.status === "completed";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-shrink-0 flex flex-col justify-between" style={{ width: "312px", height: "219px" }}>
      <div>
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] text-gray-400">Course</p>
          <p className="text-[10px] text-[#1F4842]">{course.numberOfLessons} Lessons</p>
        </div>

        <h3 className="text-sm font-semibold text-[#1F4842] mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="h-1.5 bg-[#D8F3CA] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#1F4842] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${course.progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center mb-3">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isNotStarted
                ? "bg-yellow-100 text-yellow-600"
                : isCompleted
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {isCompleted 
              ? "Completed" 
              : isNotStarted 
                ? "Not Started" 
                : "In progress"}
          </span>

          <span className="text-[10px] font-semibold text-[#1F4842]">
            {course.progress}%
          </span>
        </div>
      </div>

      <button
        className="w-full rounded-full bg-[#D8F3CA] py-2.5 text-xs text-[#006064] font-medium hover:bg-[#c5e6b8] transition-colors flex items-center justify-center gap-1.5"
        onClick={() => navigate(`../courses/${course.id}`)}
      >
        {isNotStarted ? (
          <>
            {/* <Play className="w-3.5 h-3.5" /> */}
            <span>Start</span>
          </>
        ) : isCompleted ? (
          <>
            {/* <Eye className="w-3.5 h-3.5" /> */}
            <span>Review</span>
          </>
        ) : (
          <>
            {/* <RotateCcw className="w-3.5 h-3.5" /> */}
            <span>Resume</span>
          </>
        )}
      </button>
    </div>
  );
}