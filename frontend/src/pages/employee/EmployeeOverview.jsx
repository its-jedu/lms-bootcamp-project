
import CourseCard from "./CourseCard";

export default function EmployeeOverview({ courseData }) {
  console.log("courseData received:", courseData);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completed = 1;
const inProgress = 2;
const notStarted = 1;
const priorityCourse = courseData[0].lessons[0];
; // Workplace Safety (38%) - most recently active
console.log(priorityCourse)
console.log("Hi")
  return (
     <>

   
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-[28px] font-semibold text-[#1F4842]">
          {greeting}, John
        </h1>
        <p className="text-sm font-semibold text-[#1F4842]">
          You have {inProgress} courses in progress · Keep it up!
        </p>
      </div>

      Continue card
      {priorityCourse && (
      <div className="mb-6 flex justify-between rounded-2xl bg-white p-6 shadow-md">
        <div>
          <p className="text-xs uppercase text-[#1F4842]">
            Continue where you left off
          </p>
          <h2 className="font-bold text-[#1F4842]">{priorityCourse.title}</h2>
          <p className="text-sm text-gray-500">
            {/* {priorityCourse.progress}% complete */}
            38% complete
          </p>
        </div>

        <button className="rounded-xl bg-[#1F4842] px-5 py-2 text-white">
           {/* ▷ {priorityCourse.progress === 0 ? "Start" : "Resume"} */}
           ▷ Resume
        </button>
      </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {[completed, inProgress, notStarted].map((val, i) => (
          <div key={i} className="flex-1 bg-[#D8F3CA] p-5 rounded-2xl shadow-md font-semibold">
            <p className="text-sm text-[#1F4842]">
              {/* {["Completed", "In progress", "Not started"][i]} */}
              Infor to be provide
            </p>
            <h2 className="text-3xl font-bold text-[#1F4842]">{val}</h2>
          </div>
        ))}
      </div> 

      {/* Courses */}

       {courseData.length === 0 ? (
        <div >
          <p className="font-semibold text-[#1F4842]">
            Courses will appear here once assigned by your admin
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1F4842]">Assigned Courses</h2>
            <button className="text-xs font-semibold text-[#1F4842]">View All</button>
          </div>
      
          <div className="flex gap-4 overflow-x-auto pb-4">
            {courseData.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </>  
      )}
    </>
  );
}