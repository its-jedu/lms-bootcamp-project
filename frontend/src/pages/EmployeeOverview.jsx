import { useState } from "react";

const courses = [
  { id: 1, title: "Project Management", lessons: 8, description: "A project management course equips professionals with essential skills to plan.", status: "Completed", progress: 36, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" },
  { id: 2, title: "Workplace Safety", lessons: 6, description: "A project management course equips professionals with essential skills to plan.", status: "In progress", progress: 28, image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" },
  { id: 3, title: "Team Communications Skills", lessons: 3, description: "A project management course equips professionals with essential skills to plan.", status: "New", progress: 28, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" },
  { id: 4, title: "Data Handling and GDPR", lessons: 6, description: "A project management course equips professionals with essential skills to plan.", status: "In progress", progress: 65, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80" },
  { id: 5, title: "Leadership Fundamentals", lessons: 5, description: "A project management course equips professionals with essential skills to plan.", status: "Not started", progress: 0, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80" },
];

const navItems = ["Dashboard", "My Course", "Course Library", "Track Progress"];

const getStatusClasses = (status) => {
  if (status === "Completed") return "bg-[#B8F699] text-[#1F4842]";
  if (status === "In progress") return "bg-[#B8F699]/20 text-[#1F4842]";
  if (status === "New") return "bg-[#FFF3CD] text-[#856404]";
  return "bg-gray-400/20 text-[#212429]";
};

export default function AdminOverview() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className="font-sans bg-[#f5f7f5] min-h-screen text-[#212429]">
      {/* Navbar */}
      <nav className="bg-white border-b border-black/10 px-8 h-[60px] flex items-center justify-between sticky top-0 z-[100]">
        <span className="font-bold text-[18px] text-[#1F4842] tracking-tighter">LOGO</span>
        
        <div className="flex gap-1 bg-[#f5f7f5] rounded-full p-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeNav === item 
                  ? "bg-[#1F4842] text-white" 
                  : "text-[#212429] hover:bg-[#B8F699]/20"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 items-center">
          <button className="w-[38px] h-[38px] border border-black/10 rounded-full flex items-center justify-center hover:bg-[#B8F699]/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button className="w-[38px] h-[38px] border border-black/10 rounded-full flex items-center justify-center hover:bg-[#B8F699]/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div className="w-[38px] h-[38px] rounded-full bg-[#B8F699] flex items-center justify-center font-semibold text-sm text-[#1F4842]">
            JM
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-6 md:p-8 flex flex-col gap-7">
        
        {/* Hero Banner */}
        <div className="bg-white rounded-[20px] p-7 flex flex-col gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#212429] tracking-tight">Good morning, Jamie</h1>
            <p className="text-[15px] text-[#b5b5b5] mt-1">You have 2 courses in progress · Keep it up!</p>
          </div>

          <div className="bg-[#f5f7f5] rounded-[14px] p-4 flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80" 
                className="w-full h-full object-cover" 
                alt="current course" 
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold">Workplace Safety Essentials</h4>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1F4842] w-[28%]" />
                </div>
                <span className="text-[12px] font-medium text-[#1F4842]">28%</span>
              </div>
            </div>
            <button className="bg-[#1F4842] text-white px-[22px] py-[10px] rounded-[10px] text-sm font-medium hover:bg-[#163830] transition-colors whitespace-nowrap">
              Resume Course
            </button>
          </div>
        </div>

        {/* Course Grid/Scroll Area */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recommended for you</h2>
            <button className="text-sm font-medium text-[#1F4842] hover:underline">View all</button>
          </div>
          
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 overflow-x-auto pb-2">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <img src={course.image} className="w-full h-[140px] object-cover" alt={course.title} />
                <div className="p-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-medium mb-2 ${getStatusClasses(course.status)}`}>
                    {course.status}
                  </span>
                  <h3 className="font-bold text-sm leading-tight mb-1">{course.title}</h3>
                  <p className="text-[12px] text-gray-500 line-clamp-2">{course.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}