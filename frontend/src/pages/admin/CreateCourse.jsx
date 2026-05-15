import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Paperclip,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get("edit");
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
  });

  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [materialsByLesson, setMaterialsByLesson] = useState({});
  const [videoUrl, setVideoUrl] = useState("");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState("");
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const selectedLesson = useMemo(() => {
    return lessons.find((l) => l.id === selectedLessonId) ?? null;
  }, [lessons, selectedLessonId]);

  const selectedLessonServerId = selectedLesson?.serverId || selectedLesson?.id;

  const selectedLessonMaterials = selectedLessonServerId
    ? materialsByLesson[selectedLessonServerId] || []
    : [];

  useEffect(() => {
    if (!selectedLessonServerId) return;

    async function fetchLessonMaterials() {
      try {
        const response = await axiosInstance.get(
          `/api/lessons/${selectedLessonServerId}/materials/`,
        );

        setMaterialsByLesson((prev) => ({
          ...prev,
          [selectedLessonServerId]: response.data,
        }));
      } catch (error) {
        console.error("Error fetching lesson materials:", error);
        setMaterialsByLesson((prev) => ({
          ...prev,
          [selectedLessonServerId]: [],
        }));
      }
    }
    fetchLessonMaterials();
  }, [selectedLessonServerId]);

  const loadExistingCourse = useCallback(async (courseId) => {
    try {
      const courseRes = await axiosInstance.get(`/api/courses/${courseId}/`);
      const course = courseRes.data;

      setCourseData({
        title: course.title,
        description: course.description,
      });
      setCurrentCourseId(course.id);

      try {
        const lessonsRes = await axiosInstance.get(
          `/api/courses/${courseId}/lessons/`,
        );
        const loadedLessons = lessonsRes.data.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          objective: lesson.objective || "",
          serverId: lesson.id,
        }));
        setLessons(loadedLessons);
        if (loadedLessons.length > 0) {
          setSelectedLessonId(loadedLessons[0].id);
        }
        setCurrentStep(2);
      } catch (error) {
        console.error("Error loading lessons:", error);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Error loading course:", error);
    }
  }, []);

  useEffect(() => {
    if (editCourseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadExistingCourse(editCourseId);
    }
  }, [loadExistingCourse, editCourseId]);

  const handleSaveDraft = async (e) => {
    try {
      e.preventDefault();
      if (currentCourseId) {
        await axiosInstance.patch(`/api/courses/${currentCourseId}/`, {
          title: courseData.title,
          description: courseData.description,
        });
        alert("Draft updated successfully!");
      } else {
        const payload = {
          title: courseData.title,
          description: courseData.description,
        };
        const response = await axiosInstance.post("/api/courses/", payload);
        setCurrentCourseId(response.data.id);
        alert("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft.");
    }
  };

  const handleAddLesson = async () => {
    if (!currentCourseId) {
      alert("Please save the course as draft first");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/courses/${currentCourseId}/lessons/`,
        {
          title: `Lesson ${lessons.length + 1}`,
          objective: "",
        },
      );
      const newLesson = {
        id: response.data.id,
        title: response.data.title,
        objective: response.data.objective,
        serverId: response.data.id,
      };
      setLessons((prev) => {
        setSelectedLessonId(newLesson.id);
        return [...prev, newLesson];
      });
    } catch (error) {
      console.error("Error adding lesson:", error);
      alert("Failed to add lesson");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !currentCourseId) return;

    try {
      await axiosInstance.delete(
        `/api/courses/${currentCourseId}/lessons/${lesson.serverId || lessonId}/`,
      );
      setLessons((prev) => {
        const nextLessons = prev.filter((l) => l.id !== lessonId);
        if (selectedLessonId === lessonId) {
          setSelectedLessonId(nextLessons[0]?.id ?? null);
        }
        return nextLessons;
      });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newLessons = [...lessons];
    const [draggedItem] = newLessons.splice(dragIndex, 1);
    newLessons.splice(dropIndex, 0, draggedItem);
    setLessons(newLessons);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const startEditingLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonTitle(lesson.title);
  };

  const saveEditingLesson = async (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || !currentCourseId) return;

    try {
      await axiosInstance.patch(
        `/api/courses/${currentCourseId}/lessons/${lesson.serverId || lessonId}/`,
        {
          title: editingLessonTitle,
          objective: lesson.objective || "",
        },
      );
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId ? { ...l, title: editingLessonTitle } : l,
        ),
      );
      setEditingLessonId(null);
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert("Failed to update lesson");
    }
  };

  const handleSaveLesson = async () => {
    if (!selectedLesson || !currentCourseId) return;

    if (selectedLessonMaterials.length === 0) {
      alert("Please add at least one material before saving this lesson.");
      return;
    }

    try {
      const payload = {
        title: selectedLesson.title,
        objective: selectedLesson.objective || "",
      };
      await axiosInstance.patch(
        `/api/courses/${currentCourseId}/lessons/${selectedLesson.serverId || selectedLesson.id}/`,
        payload,
      );
      alert("Lesson saved successfully!");
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson");
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !selectedLessonServerId || !currentCourseId) return;

    setIsUploadingMaterial(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(
          `/api/lessons/${selectedLessonServerId}/materials/file/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        setMaterialsByLesson((prev) => ({
          ...prev,
          [selectedLessonServerId]: [
            ...(prev[selectedLessonServerId] || []),
            response.data,
          ],
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload material");
    } finally {
      setIsUploadingMaterial(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddVideo = async () => {
    if (!videoUrl || !selectedLessonServerId || !currentCourseId) return;

    try {
      const response = await axiosInstance.post(
        `/api/lessons/${selectedLessonServerId}/materials/video/`,
        { video_url: videoUrl },
      );
      setMaterialsByLesson((prev) => ({
        ...prev,
        [selectedLessonServerId]: [
          ...(prev[selectedLessonServerId] || []),
          response.data,
        ],
      }));
      setVideoUrl("");
      alert("Video URL saved successfully!");
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Failed to save video URL");
    }
  };

  const removeMaterial = async (materialId) => {
    if (!selectedLessonServerId) return;

    try {
      await axiosInstance.delete(
        `/api/lessons/${selectedLessonServerId}/materials/${materialId}/`,
      );

      setMaterialsByLesson((prev) => ({
        ...prev,
        [selectedLessonServerId]: (prev[selectedLessonServerId] || []).filter(
          (material) => material.id !== materialId,
        ),
      }));
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] p-5">
      {/* STEP 1: BASIC INFORMATION */}
      {currentStep === 1 && (
        <div className="max-w-[680px] mx-auto">
          {/* BACK */}
          <button
            onClick={() => navigate("/admin/courses")}
            className="flex items-center gap-1 text-[13px] text-[#202020] mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* CARD */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[32px] font-bold text-[#1f4842] leading-none">
                  Basic Information
                </h1>
                <p className="text-[11px] text-[#7d7d7d] mt-[6px]">
                  Provide the basic course details below
                </p>
              </div>
              <div className="text-[12px] text-gray-700">
                <span className="font-semibold">Status:</span>{" "}
                <span className="text-gray-600">Draft</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span>Course Title
                </label>
                <Input
                  value={courseData.title}
                  onChange={(e) =>
                    setCourseData({ ...courseData, title: e.target.value })
                  }
                  className="w-full h-10 text-[12px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span>Course Description
                </label>
                <Textarea
                  rows={5}
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      description: e.target.value,
                    })
                  }
                  className="w-full text-[12px] resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="h-8 text-[11px]"
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => {
                  if (!currentCourseId) {
                    alert("Please save the course as draft first");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="h-8 px-6 bg-[#1f4842] hover:bg-[#173a35] text-white text-[11px] font-semibold"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: COURSE MATERIAL */}
      {currentStep === 2 && (
        <div className="max-w-[1180px] mx-auto flex gap-5">
          {/* SIDEBAR */}
          <div className="w-[235px]">
            {/* BACK */}
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1 text-[13px] text-[#202020] mb-5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* COURSE MATERIAL */}
            <div>
              <h2 className="text-[24px] font-bold text-[#1f4842] mb-4">
                Course Material
              </h2>

              {/* ADD LESSON */}
              <button
                onClick={handleAddLesson}
                className="flex items-center gap-2 mb-6"
              >
                <div className="w-[22px] h-[22px] rounded-[4px] bg-[#1f4842] flex items-center justify-center">
                  <Plus className="w-[13px] h-[13px] text-white" />
                </div>

                <span className="text-[13px] font-medium text-[#1f4842]">
                  Add Lesson
                </span>
              </button>

              {/* LESSON LIST */}
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between ${
                      dragOverIndex === index && dragIndex !== index
                        ? "border-t-2 border-[#1f4842] pt-2"
                        : ""
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setVideoUrl("");
                      }}
                    >
                      {/* DRAG ICON */}
                      <GripVertical className="w-[15px] h-[15px] text-[#9a9a9a] cursor-grab flex-shrink-0" />

                      {editingLessonId === lesson.id ? (
                        <input
                          value={editingLessonTitle}
                          onChange={(e) =>
                            setEditingLessonTitle(e.target.value)
                          }
                          onBlur={() => saveEditingLesson(lesson.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditingLesson(lesson.id);
                            if (e.key === "Escape") setEditingLessonId(null);
                          }}
                          className="text-[12px] text-[#333333] bg-transparent border-b border-[#1f4842] outline-none flex-1 min-w-0"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className={`text-[12px] truncate ${
                            selectedLessonId === lesson.id
                              ? "text-[#1f4842] font-medium"
                              : "text-[#333333]"
                          }`}
                        >
                          {lesson.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingLesson(lesson);
                        }}
                        disabled={courseData.status === "published"}
                      >
                        <Pencil className="w-[13px] h-[13px] text-[#9a9a9a]" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        disabled={courseData.status === "published"}
                      >
                        <Trash2 className="w-[13px] h-[13px] text-[#9a9a9a]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* FORM CARD */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              {/* TITLE */}
              <div className="mb-6">
                <h1 className="text-[32px] font-bold text-[#1f4842] leading-none">
                  Course Structure
                </h1>

                <p className="text-[11px] text-[#7d7d7d] mt-[6px]">
                  Organize lessons by course and add content
                </p>
              </div>

              {/* LESSON TITLE */}
              <div className="mb-5">
                <label className="block text-[24px] font-bold text-[#1f4842] mb-3">
                  Lesson Title
                </label>

                <Input
                  value={selectedLesson?.title ?? ""}
                  onChange={(e) => {
                    if (selectedLesson) {
                      setLessons((prev) =>
                        prev.map((l) =>
                          l.id === selectedLesson.id
                            ? { ...l, title: e.target.value }
                            : l,
                        ),
                      );
                    }
                  }}
                  disabled={!selectedLesson}
                  className="h-[38px] rounded-none border-[#d8d8d8] text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mb-5">
                <label className="block text-[24px] font-bold text-[#1f4842] mb-3">
                  Lesson Description
                </label>

                <div className="border border-[#d8d8d8]">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={selectedLesson?.objective ?? ""}
                    onChange={(value) => {
                      if (selectedLesson) {
                        setLessons((prev) =>
                          prev.map((l) =>
                            l.id === selectedLesson.id
                              ? { ...l, objective: value }
                              : l,
                          ),
                        );
                      }
                    }}
                    readOnly={!selectedLesson}
                    className="custom-quill"
                  />
                </div>
              </div>

              {/* VIDEO */}
              <div className="mb-5">
                <div className="flex items-center gap-1 mb-3">
                  <label className="text-[24px] font-bold text-[#1f4842]">
                    Add Video - Embed link
                  </label>

                  <span className="text-[10px] text-[#7d7d7d] mt-2">
                    (from Youtube or Vimeo)
                  </span>
                </div>

                <div className="relative">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={!selectedLesson}
                    placeholder="Paste video URL here"
                    className="h-[36px] rounded-none border-[#d8d8d8] pr-10 text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  {videoUrl && (
                    <button
                      onClick={() => setVideoUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      disabled={courseData.status === "published"}
                    >
                      <X className="w-[13px] h-[13px] text-[#9a9a9a]" />
                    </button>
                  )}
                </div>

                {videoUrl && (
                  <button
                    onClick={handleAddVideo}
                    className="text-[11px] text-[#1f4842] mt-2 hover:underline"
                    disabled={courseData.status === "published"}
                  >
                    Save Video URL
                  </button>
                )}
              </div>

              {/* RESOURCES */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <label className="text-[24px] font-bold text-[#1f4842]">
                    Add Resources
                  </label>

                  {/* CHOOSE FILE */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!selectedLesson}
                    className="bg-[#1f4842] hover:bg-[#173a35] text-white text-[11px] px-3 h-[28px] rounded-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Choose Files
                  </button>
                </div>

                <p className="text-[11px] text-[#7d7d7d] mb-4">
                  Supported files: Audio (MP3 and WAV), File (PDF)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".mp3,.wav,.pdf"
                  disabled={courseData.status === "published"}
                />

                {isUploadingMaterial && (
                  <p className="mb-3 text-[10px] text-[#7d7d7d]">
                    Uploading...
                  </p>
                )}

                {/* FILES */}
                <div className="space-y-3">
                  {selectedLessonMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between max-w-[320px]"
                    >
                      <div className="flex items-start gap-2">
                        <Paperclip className="w-[13px] h-[13px] text-[#8c8c8c] mt-[2px]" />

                        <div>
                          <p className="text-[11px] text-[#222222]">
                            {material.filename ||
                              material.video_url ||
                              "Lesson Material"}
                          </p>

                          <p className="text-[10px] text-[#7d7d7d]">
                            {material.material_type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button disabled={courseData.status === "published"}>
                          <Pencil className="w-[13px] h-[13px] text-[#8c8c8c]" />
                        </button>

                        <button
                          onClick={() => removeMaterial(material.id)}
                          disabled={courseData.status === "published"}
                        >
                          <Trash2 className="w-[13px] h-[13px] text-[#8c8c8c]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveLesson}
                  disabled={!selectedLesson || courseData.status === "published"}
                  className="bg-[#1f4842] hover:bg-[#173a35] h-[34px] px-6 rounded-[4px] text-[12px] text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-quill .ql-toolbar {
          border: none;
          border-bottom: 1px solid #d8d8d8;
          padding: 6px 8px;
        }

        .custom-quill .ql-container {
          border: none;
          min-height: 150px;
          font-size: 12px;
        }

        .custom-quill .ql-editor {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}