import React from "react";

const lessons = [
  { id: 1, title: "Introduction to safety", status: "done" },
  { id: 2, title: "Hazard types", status: "done" },
  { id: 3, title: "Emergency procedures", status: "active" },
  { id: 4, title: "PPE guidelines", status: "todo" },
  { id: 5, title: "Reporting incidents", status: "todo" },
  { id: 6, title: "Review & summary", status: "todo" },
];

const LessonIcon = ({ status }) => {
  const base =
    "w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-xs";

  if (status === "done")
    return (
      <div className={`${base} bg-[#1F4842] border-[#1F4842] text-white`}>
        ✓
      </div>
    );
  if (status === "active")
    return (
      <div className={`${base} bg-[#1F4842] border-[#1F4842] text-white`}>
        ▷
      </div>
    );
  return (
    <div className={`${base} border-[#c8ddd9] text-gray-400`}>☰</div>
  );
};

export default function CourseLessonPage() {
  return (
    <div className="flex min-h-[580px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-60 min-w-[240px] bg-white border-r border-gray-200 flex flex-col py-4">
        {/* Back */}
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-4 pb-3 text-left">
          ‹ Back
        </button>

        {/* Thumbnail */}
        <div className="mx-4 mb-3 h-24 rounded-xl bg-[#cce8e2]" />

        {/* Course info */}
        <p className="px-4 text-sm font-medium text-gray-800">
          Workplace Safety
        </p>
        <p className="px-4 text-xs text-gray-500 mt-0.5 mb-2">
          6 Lessons · 38%
        </p>

        {/* Progress bar */}
        <div className="mx-4 mb-4 h-1.5 rounded-full bg-[#d6eee8] overflow-hidden">
          <div className="h-full w-[38%] rounded-full bg-[#1F4842]" />
        </div>

        {/* Lesson list */}
        <div className="flex flex-col gap-0.5 px-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer text-sm transition-colors ${
                lesson.status === "active"
                  ? "bg-[#e6f4f0] text-[#1F4842] font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LessonIcon status={lesson.status} />
              <span>{lesson.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white flex flex-col gap-3.5 p-6">
        {/* Lesson header */}
        <div>
          <h2 className="text-xl font-medium text-gray-900">
            Emergency procedures
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Lesson 3 of 6 · Video · 8 minutes
          </p>
        </div>

        {/* Video placeholder */}
        <div className="h-[280px] rounded-2xl bg-[#cce8e2] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center cursor-pointer">
            <span className="text-[#1F4842] text-xl ml-0.5">▷</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button className="bg-[#e8f5f0] text-[#1F4842] border border-[#a8d5c7] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#d4eee5] transition-colors">
            Mark as Completed
          </button>
          <button className="bg-white border border-gray-300 text-gray-800 rounded-xl px-5 py-2 text-sm hover:bg-gray-50 transition-colors">
            Next
          </button>
          <button className="ml-auto bg-[#1F4842] text-white rounded-xl px-5 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-[#17352e] transition-colors">
            ▷ Resume
          </button>
        </div>

        {/* Course description */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">
            Project Management
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            A project management course equips professionals with essential
            skills to plan, execute, and close projects successfully. A project
            management course equips professionals with essential skills to
            plan, execute, and deliver results on time and within budget,
            ensuring teams stay aligned throughout the process.
          </p>
        </div>
      </div>
    </div>
  );
}