import { useMemo, useState } from "react";
import { SkipBack } from "lucide-react";

export default function Dashboard() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("Lesson Title 1");
  const [lessonContent, setLessonContent] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [resources, setResources] = useState([]);

  const courseMaterial = useMemo(
    () => [
      { id: 1, title: "Lesson 1" },
      { id: 2, title: "Lesson 2" },
    ],
    []
  );

  const courses = useMemo(
    () => [
      { id: 1, title: "Course name", status: "Published" },
      { id: 2, title: "Course name", status: "Draft" },
      { id: 3, title: "course name", status: "Draft" },
    ],
    []
  );

  const navItems = ["Dashboard", "Create Course", "Manage Employee", "Assign Course", "Track Progress"];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setResources([...resources, ...files.map(f => ({ name: f.name, size: f.size }))]);
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log({ lessonTitle, lessonContent, videoLink, resources });
    alert("Lesson saved successfully!");
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Course Material */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-28 border border-gray-200">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-800">Course Material</h2>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors mb-4">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Add Lesson
              </button>

              <div className="space-y-1">
                {courseMaterial.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson.id)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedLesson === lesson.id
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-700">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label={`Edit ${lesson.title}`}
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label={`Delete ${lesson.title}`}
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Structure Section */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">Course Structure</h1>
                <p className="text-sm text-gray-600 mt-1">Organise lessons by course and add content</p>
              </div>

              {/* Lesson Title */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Lesson Title 1</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter lesson title"
                />
              </div>

              {/* Add Lesson Content */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">Add Lesson Content</label>
                  <div className="flex gap-1 text-gray-600">
                    <button className="p-1 hover:bg-gray-100 rounded" title="Font">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded font-bold">B</button>
                    <button className="p-1 hover:bg-gray-100 rounded italic">I</button>
                    <button className="p-1 hover:bg-gray-100 rounded underline">U</button>
                    <button className="p-1 hover:bg-gray-100 rounded">≡</button>
                  </div>
                </div>
                <textarea
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-40"
                  placeholder="Add your lesson content here..."
                />
              </div>

              {/* Add Video */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add Video - Embed link
                  <span className="text-xs text-gray-500 font-normal"> (Paste from YouTube or Vimeo)</span>
                </label>
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              {/* Add Resources */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Add Resources</label>
                    <p className="text-xs text-gray-500 mt-0.5">Support files, Documents, Live PDF</p>
                  </div>
                  <label className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded cursor-pointer hover:bg-green-700 transition-colors">
                    Choose file
                    <input type="file" multiple hidden onChange={handleFileUpload} />
                  </label>
                </div>

                {resources.length > 0 && (
                  <div className="space-y-2">
                    {resources.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7a2 2 0 11-4 0 2 2 0 014 0zM16.5 1H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12.5c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-4.5 6a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeResource(idx)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Courses Table Section */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Course</h2>
                <p className="text-sm text-gray-600 mt-1">View all your draft and publishes courses</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Course Title</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-700">{course.title}</td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              course.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button className="px-4 py-1.5 bg-green-700 text-white text-sm font-semibold rounded hover:bg-green-800 transition-colors">
                            Publish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
