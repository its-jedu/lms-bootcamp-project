import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { api } from "@/services/api";

export default function EmployeeHome() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const p = await api("/employee/profile");
      const c = await api("/courses/");
      setProfile(p);
      setCourses(c);
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-green-900">
          Good morning, {profile?.first_name || "User"}
        </h1>
        <p className="text-gray-600">
          {courses.length === 0
            ? "No courses assigned yet · Let’s Start!"
            : "Continue your learning"}
        </p>
      </div>

      {/* Course Card */}
      {courses[0] && (
        <div className="mt-6 bg-white p-6 rounded-xl flex justify-between items-center shadow">
          <div>
            <p className="text-sm text-gray-500">Lets begin with</p>
            <h2 className="text-lg font-semibold text-green-900">
              {courses[0].title}
            </h2>
          </div>

          <button className="flex items-center gap-2 bg-green-900 text-white px-5 py-2 rounded">
            <Play size={16} />
            Start
          </button>
        </div>
      )}
    </>
  );
}