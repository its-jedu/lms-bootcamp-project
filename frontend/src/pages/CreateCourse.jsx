import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: null,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [modules, setModules] = useState([
    {
      id: 1,
      name: "Module 1",
      objective: "",
      lessons: [
        { id: 1, name: "Lesson 1", objective: "", content: "" },
        { id: 2, name: "Lesson 2", objective: "", content: "" },
      ],
    },
  ]);

  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const steps = useMemo(
    () => [
      { number: 1, name: "Basic Information" },
      { number: 2, name: "Course Material" },
      { number: 3, name: "Review & Publish" },
    ],
    []
  );

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) ?? null,
    [modules, selectedModuleId]
  );

  const selectedLesson = useMemo(() => {
    if (!selectedModule) return null;
    return selectedModule.lessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [selectedModule, selectedLessonId]);

  const handleNext = () => {
    setCurrentStep((prev) => {
      if (prev < 3) return prev + 1;
      handlePublish();
      return prev;
    });
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSaveDraft = () => {
    console.log("Draft:", { courseData, modules });
    navigate("/admin/dashboard");
  };

  const handlePublish = () => {
    console.log("Publish:", { courseData, modules });
    alert("Course published successfully!");
    navigate("/admin/dashboard");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCourseData((prev) => ({ ...prev, thumbnail: file }));

    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddModule = () => {
    setModules((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((m) => m.id)) + 1 : 1;
      const newModule = {
        id: nextId,
        name: `Module ${nextId}`,
        objective: "",
        lessons: [],
      };
      setSelectedModuleId(nextId);
      setSelectedLessonId(null);
      return [...prev, newModule];
    });
  };

  const handleDeleteModule = (id) => {
    setModules((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      if (selectedModuleId === id) {
        const fallback = filtered[0] ?? null;
        setSelectedModuleId(fallback?.id ?? null);
        setSelectedLessonId(fallback?.lessons?.[0]?.id ?? null);
      }
      return filtered;
    });
  };

  const handleAddLesson = () => {
    if (!selectedModuleId) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== selectedModuleId) return m;

        const nextLessonId = m.lessons.length
          ? Math.max(...m.lessons.map((l) => l.id)) + 1
          : 1;

        const newLesson = {
          id: nextLessonId,
          name: `Lesson ${nextLessonId}`,
          objective: "",
          content: "",
        };

        setSelectedLessonId(nextLessonId);
        return { ...m, lessons: [...m.lessons, newLesson] };
      })
    );
  };

  const handleDeleteLesson = (lessonId) => {
    if (!selectedModuleId) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== selectedModuleId) return m;
        const nextLessons = m.lessons.filter((l) => l.id !== lessonId);
        if (selectedLessonId === lessonId) {
          setSelectedLessonId(nextLessons[0]?.id ?? null);
        }
        return { ...m, lessons: nextLessons };
      })
    );
  };

  const updateModule = (patch) => {
    if (!selectedModuleId) return;
    setModules((prev) =>
      prev.map((m) => (m.id === selectedModuleId ? { ...m, ...patch } : m))
    );
  };

  const updateLesson = (lessonId, patch) => {
    if (!selectedModuleId) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== selectedModuleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...patch } : l
          ),
        };
      })
    );
  };

  const StepTabs = () => (
    <div className="mb-4 flex flex-wrap gap-2">
      {steps.map((s) => {
        const active = s.number === currentStep;
        return (
          <button
            key={s.number}
            type="button"
            onClick={() => setCurrentStep(s.number)}
            className={`px-3 py-2 rounded-md text-[12px] border transition-colors ${
              active
                ? "bg-[#0F2F2A] text-white border-[#0F2F2A]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );

  const Sidebar = () => {
    // Get all lessons from all modules in a flat list
    const allLessons = modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleId: m.id }))
    );

    return (
      <aside className="w-full lg:w-[280px] shrink-0">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={handleAddLesson}
              className="h-8 w-8 rounded-full bg-[#0F3D3A] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#0c3229] transition-colors"
              title="Add Lesson"
            >
              <span className="text-sm font-bold">+</span>
            </button>
            <span className="text-xs font-medium text-gray-700">Add Lesson</span>
          </div>
        </div>

        <div className="space-y-1">
          {allLessons.map((l) => {
            const lessonActive = l.id === selectedLessonId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setSelectedModuleId(l.moduleId);
                  setSelectedLessonId(l.id);
                }}
                className={`w-full px-3 py-2.5 text-left text-xs font-medium transition-colors flex items-center justify-between group border rounded ${
                  lessonActive
                    ? "bg-white text-gray-900 border-gray-300"
                    : "text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="5" cy="5" r="1" />
                    <circle cx="10" cy="5" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="5" cy="10" r="1" />
                    <circle cx="10" cy="10" r="1" />
                    <circle cx="15" cy="10" r="1" />
                    <circle cx="5" cy="15" r="1" />
                    <circle cx="10" cy="15" r="1" />
                    <circle cx="15" cy="15" r="1" />
                  </svg>
                  <span className="truncate">{l.name}</span>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModuleId(l.moduleId);
                      setSelectedLessonId(l.id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModuleId(l.moduleId);
                      handleDeleteLesson(l.id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </button>
            );
          })}

          {allLessons.length === 0 && (
            <div className="text-xs text-gray-400 px-3 py-2">No lessons yet</div>
          )}
        </div>
      </aside>
    );
  };

  const CourseMaterialRight = () => (
    <div className="flex-1">
      <div>
        <div className="text-[13px] font-semibold text-gray-900">
          Course Structure
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Organise lessons by course and add content
        </div>
      </div>

      {/* Lesson Title */}
      <div className="mt-6">
        <div className="text-[11px] text-gray-700 mb-2">
          <span className="text-red-500">*</span>Lesson Title
        </div>
        <input
          value={selectedLesson?.name ?? ""}
          onChange={(e) =>
            selectedLesson && updateLesson(selectedLesson.id, { name: e.target.value })
          }
          disabled={!selectedLesson}
          className="w-full h-9 px-3 border border-gray-300 rounded-md text-[12px] outline-none disabled:bg-gray-50"
          placeholder="Lesson Title"
        />
      </div>

      {/* Add Lesson Content */}
      <div className="mt-6">
        <div className="text-[12px] font-semibold text-gray-900 mb-3">
          Add Lesson Content
        </div>

        <div className="border border-gray-300 rounded-md bg-white">
          <div className="border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap text-[11px]">
            <select className="px-2 py-1 border border-gray-300 rounded text-[11px]">
              <option>Font</option>
            </select>
            <button className="px-2 py-1 hover:bg-gray-100 rounded font-semibold">B</button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded italic">I</button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded underline">U</button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button className="px-2 py-1 hover:bg-gray-100 rounded">•</button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded">1.</button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded">→</button>
          </div>
          <div className="h-[200px] p-3"></div>
        </div>
      </div>

      {/* Add Video */}
      <div className="mt-6">
        <div className="text-[12px] font-semibold text-gray-900 mb-2">
          Add Video - Embed Link
        </div>
        <p className="text-[10px] text-gray-600 mb-3">Embed from YouTube or Vimeo</p>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <input
            type="text"
            placeholder="Paste video URL here"
            className="w-full h-9 px-3 border border-gray-300 rounded-md text-[12px] outline-none"
          />
          <button
            onClick={() => {}}
            className="mt-2 text-[10px] text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Add Resources */}
      <div className="mt-6">
        <div className="text-[12px] font-semibold text-gray-900 mb-2">
          Add Resources
        </div>
        <p className="text-[10px] text-gray-600 mb-3">Supported files: Audio (MP3 and WAV), Files (PDF)</p>

        <div className="space-y-3">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="border border-gray-200 rounded-md p-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] text-gray-700">{file.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94m-4.75-4.75L19.5 7.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" fill="#666"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.mp3,.wav,.pdf';
              input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFiles([...uploadedFiles, { name: file.name, status: 'success' }]);
                }
              };
              input.click();
            }}
            className="w-full h-9 px-4 rounded-lg bg-[#0F3D3A] text-white text-xs font-semibold hover:bg-[#0c3229]"
          >
            Choose files
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="mt-8">
        <div className="text-[12px] font-semibold text-gray-900 mb-2">
          Course
        </div>
        <div className="text-[10px] text-gray-600 mb-3">
          view all your draft and publishes courses
        </div>

        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Course Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">Course name</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded text-[10px] bg-green-100 text-green-700">Published</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-[10px] text-blue-600 hover:underline">Publish</button>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">Course name</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded text-[10px] bg-blue-100 text-blue-700">Draft</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-[10px] text-blue-600 hover:underline">Publish</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">Course name</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded text-[10px] bg-blue-100 text-blue-700">Draft</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-[10px] text-blue-600 hover:underline">Publish</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="h-9 px-6 rounded-lg bg-[#0F3D3A] text-white text-xs font-semibold hover:bg-[#0c3229]"
        >
          Save
        </button>
      </div>
    </div>
  );

  const BasicInfo = () => (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[13px] font-semibold text-gray-900">
            Basic Information
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Provide the basic course details below
          </div>
        </div>
        <div className="text-[12px] text-gray-700">
          <span className="font-semibold">Status:</span> <span className="text-gray-600">Draft</span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-2">
            <span className="text-red-500">*</span>Course Title
          </label>
          <input
            type="text"
            className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-[12px] outline-none"
            value={courseData.title}
            onChange={(e) =>
              setCourseData({ ...courseData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 mb-2">
            <span className="text-red-500">*</span>Course Description
          </label>
          <textarea
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[12px] outline-none resize-none"
            value={courseData.description}
            onChange={(e) =>
              setCourseData({ ...courseData, description: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="h-8 px-4 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="h-8 px-6 rounded-md bg-[#0F2F2A] text-white text-[11px] font-semibold hover:bg-[#0b241f]"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Review = () => (
    <div className="max-w-5xl">
      <div className="text-[13px] font-semibold text-gray-900 mb-1">
        Review & Publish
      </div>
      <div className="text-[11px] text-gray-500 mb-6">
        Review your course before publishing
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <div className="text-[11px] text-gray-500">Course Title</div>
          <div className="text-[13px] font-semibold text-gray-900">
            {courseData.title || "Not set"}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-gray-500">Description</div>
          <div className="text-[12px] text-gray-800">
            {courseData.description || "Not set"}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-gray-500">Category</div>
          <div className="text-[12px] text-gray-800">
            {courseData.category || "Not set"}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleBackStep}
          className="h-8 px-4 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="h-8 px-6 rounded-md bg-[#0F2F2A] text-white text-[11px] font-semibold hover:bg-[#0b241f]"
        >
          Publish
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 min-h-screen">
      {/* Top back */}
      <div className="px-8 pt-6">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-[12px] text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        >
          <span className="text-base leading-none">‹</span>
          Back
        </button>
      </div>

      {/* Centered page */}
      <div className="px-8 pb-10 pt-4">
        <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-md">
          <div className="px-10 pt-8 pb-8">
            {currentStep !== 1 && (
              <div className="text-[15px] font-semibold text-gray-900 mb-6">
                {steps[currentStep - 1]?.name ?? "Create Course"}
              </div>
            )}

            {/* Layout: sidebar + main */}
            <div className={currentStep === 1 ? "" : "mt-2 flex flex-col lg:flex-row gap-8"}>
              {currentStep !== 1 && <Sidebar />}

              <div className={currentStep === 1 ? "" : "flex-1"}>
                {currentStep === 1 && <BasicInfo />}
                {currentStep === 2 && <CourseMaterialRight />}
                {currentStep === 3 && <Review />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}