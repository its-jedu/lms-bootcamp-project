import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  FileText,
  FileDown,
  Headphones,
  BookOpen,
} from "lucide-react";
import cachedApi from "../../api/cachedApi";
import env from "../../config/env";
import { Button } from "@/components/ui/button";

function getYouTubeThumbnail(url) {
  if (!url) return null;
  
  let videoId = null;
  
  if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v");
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
  }
  
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  return null;
}

function getFullUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${env.API_URL}${path}`;
}

export default function EmployeeLesson() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const courseResponse = await cachedApi.get(`api/courses/${courseId}/`, {
          ttl: 10 * 60 * 1000,
          cacheKey: `course_${courseId}`,
        });
        
        const lessonsResponse = await cachedApi.get(`api/courses/${courseId}/lessons/`, {
          ttl: 10 * 60 * 1000,
          cacheKey: `course_lessons_${courseId}`,
        });
        
        setCourse(courseResponse.data);
        setLessons(lessonsResponse.data);
        
        const initialStatuses = {};
        lessonsResponse.data.forEach(lesson => {
          initialStatuses[lesson.id] = "not_started";
        });
        setLessonStatuses(initialStatuses);
        
        if (lessonsResponse.data.length > 0) {
          setSelectedLesson(lessonsResponse.data[0]);
        }
        
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    })();
  }, [courseId]);

  useEffect(() => {
    if (selectedLesson) {
      setIsPlaying(false);
      (async () => {
        try {
          const materialsResponse = await cachedApi.get(
            `api/lessons/${selectedLesson.id}/materials/`,
            {
              ttl: 10 * 60 * 1000,
              cacheKey: `lesson_materials_${selectedLesson.id}`,
            }
          );
          setMaterials(materialsResponse.data);
        } catch (error) {
          console.error("Failed to fetch materials:", error);
          setMaterials([]);
        }
      })();
    }
  }, [selectedLesson]);

  const completedLessons = Object.values(lessonStatuses).filter(
    status => status === "completed"
  ).length;
  
  const courseProgress = lessons.length > 0 
    ? Math.round((completedLessons / lessons.length) * 100) 
    : 0;

  const currentLessonIndex = lessons.findIndex(l => l.id === selectedLesson?.id);
  const currentLessonStatus = selectedLesson ? lessonStatuses[selectedLesson.id] : "not_started";

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (!selectedLesson) return;
    
    setLessonStatuses(prev => ({
      ...prev,
      [selectedLesson.id]: prev[selectedLesson.id] === "completed" ? "in_progress" : "completed"
    }));
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      
      if (lessonStatuses[selectedLesson.id] !== "completed") {
        setLessonStatuses(prev => ({
          ...prev,
          [selectedLesson.id]: "in_progress"
        }));
      }
      
      setSelectedLesson(nextLesson);
    }
  };

  const handleStartLesson = () => {
    if (selectedLesson) {
      setLessonStatuses(prev => ({
        ...prev,
        [selectedLesson.id]: "in_progress"
      }));
      setIsPlaying(true);
    }
  };

  const getLessonType = (materials) => {
    const types = materials.map(m => m.material_type);
    if (types.includes("video")) return "Video";
    if (types.includes("audio")) return "Audio";
    if (types.includes("pdf")) return "PDF";
    if (types.includes("text")) return "Reading";
    return "";
  };

  const getLessonDuration = (materials) => {
    const hasVideo = materials.some(m => m.material_type === "video" && m.video_url);
    const hasAudio = materials.some(m => m.material_type === "audio" && m.file);
    if (hasVideo) return "8 minutes";
    if (hasAudio) return "5 minutes";
    return "";
  };

  const getVideoMaterial = () => {
    return materials.find(m => m.material_type === "video" && m.video_url);
  };

  const getPdfMaterials = () => {
    return materials.filter(m => m.material_type === "pdf" && m.file);
  };

  const getAudioMaterials = () => {
    return materials.filter(m => m.material_type === "audio" && m.file);
  };

  const getTextMaterial = () => {
    return materials.find(m => m.material_type === "text" && m.text_content);
  };

  const formatDescription = (text) => {
    if (!text) return "";
    const doc = new DOMParser().parseFromString(text, "text/html");
    return doc.body.textContent || "";
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1F4842] border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!course || !selectedLesson) {
    return (
      <div className="text-center py-10">
        <p className="text-[#1F4842] font-semibold">Course not found</p>
      </div>
    );
  }

  const lessonType = getLessonType(materials);
  const lessonDuration = getLessonDuration(materials);
  const videoMaterial = getVideoMaterial();
  const pdfMaterials = getPdfMaterials();
  const audioMaterials = getAudioMaterials();
  const textMaterial = getTextMaterial();
  const hasStarted = currentLessonStatus === "in_progress" || currentLessonStatus === "completed";
  const thumbnailUrl = videoMaterial ? getYouTubeThumbnail(videoMaterial.video_url) : null;
  const hasContent = materials.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.7, ease: "easeOut" }}
      className="flex min-h-[580px] overflow-hidden rounded-2xl border border-gray-200 bg-white font-sans"
    >
      {/* Sidebar */}
      <div className="flex w-72 min-w-[288px] flex-col border-r border-gray-200 bg-white py-4">
        <button 
          onClick={() => navigate("/employee/courses")}
          className="px-4 pb-3 text-left text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="mx-4 mb-3 h-24 rounded-xl bg-[#cce8e2] flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#1F4842]" />
        </div>

        <p className="px-4 text-sm font-medium text-gray-800">
          {course.title}
        </p>

        <p className="mt-0.5 mb-2 px-4 text-xs text-gray-500">
          {lessons.length} Lessons · {courseProgress}%
        </p>

        <div className="mx-4 mb-4 h-1.5 overflow-hidden rounded-full bg-[#d6eee8]">
          <div 
            className="h-full rounded-full bg-[#1F4842] transition-all duration-500"
            style={{ width: `${courseProgress}%` }}
          />
        </div>

        <div className="flex flex-col gap-0.5 px-2 overflow-y-auto">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonSelect(lesson)}
              className={`cursor-pointer rounded-xl px-2.5 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                selectedLesson?.id === lesson.id
                  ? "bg-[#e6f4f0] text-[#1F4842] font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {lessonStatuses[lesson.id] === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-[#1F4842] flex-shrink-0" />
              ) : selectedLesson?.id === lesson.id ? (
                <div className="w-5 h-5 rounded-full bg-[#1F4842] flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 text-white ml-0.5" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span className="line-clamp-1 text-sm">{lesson.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-white p-6 overflow-y-auto">
        {/* Lesson header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedLesson.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Lesson {currentLessonIndex + 1} of {lessons.length}
            {lessonType && (
              <>
                <span className="mx-1.5">·</span>
                {lessonType}
              </>
            )}
            {lessonDuration && (
              <>
                <span className="mx-1.5">·</span>
                {lessonDuration}
              </>
            )}
          </p>
        </div>

        {/* Content Area */}
        <div className="mb-4 space-y-4">
          {/* VIDEO - Only show if there's an actual video URL */}
          {videoMaterial && (
            isPlaying ? (
              <div>
                {videoMaterial.video_url.includes("youtube.com") ||
                videoMaterial.video_url.includes("youtu.be") ? (
                  <iframe
                    width="100%"
                    height="400"
                    className="rounded-xl"
                    src={`${videoMaterial.video_url
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}?autoplay=1`}
                    title="Lesson Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    className="w-full rounded-xl"
                    style={{ maxHeight: "400px" }}
                  >
                    <source src={getFullUrl(videoMaterial.video_url)} />
                    Your browser does not support the video element.
                  </video>
                )}
              </div>
            ) : (
              <div 
                className="relative h-[280px] rounded-2xl overflow-hidden cursor-pointer" 
                onClick={handleStartLesson}
              >
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={selectedLesson.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#cce8e2]" />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-105 transition-all">
                    <Play className="w-6 h-6 text-[#1F4842] ml-0.5" />
                  </div>
                </div>
              </div>
            )
          )}

          {/* PDF */}
          {pdfMaterials.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Download Materials</p>
              {pdfMaterials.map((material) => (
                <div 
                  key={material.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#f0f7f4] border border-[#cce8e2]"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#1F4842]" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {material.filename || "Lesson Material"}
                      </p>
                      <p className="text-xs text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={getFullUrl(material.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1F4842] text-white text-sm hover:bg-[#17352e] transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* AUDIO */}
          {audioMaterials.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Audio Materials</p>
              {audioMaterials.map((material) => (
                <div 
                  key={material.id}
                  className="p-4 rounded-xl bg-[#f0f7f4] border border-[#cce8e2]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Headphones className="w-8 h-8 text-[#1F4842]" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {material.filename || "Audio Material"}
                      </p>
                      <p className="text-xs text-gray-500">Audio</p>
                    </div>
                  </div>
                  <audio controls className="w-full">
                    <source src={getFullUrl(material.file)} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
          )}

          {/* TEXT */}
          {textMaterial && (
            <div className="p-6 rounded-xl bg-[#f0f7f4] border border-[#cce8e2]">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-[#1F4842]" />
                <p className="text-sm font-medium text-gray-800">Lesson Content</p>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {textMaterial.text_content}
              </div>
            </div>
          )}

          {/* No content */}
          {!hasContent && (
            <div className="flex h-[280px] items-center justify-center rounded-2xl bg-[#cce8e2]">
              <p className="text-[#1F4842] text-sm">No content available for this lesson</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 mb-4 mt-auto">
          <Button
            variant="outline"
            className={`border-[#a8d5c7] bg-[#e8f5f0] text-[#1F4842] hover:bg-[#d4eee5] ${
              currentLessonStatus === "completed" ? "opacity-70" : ""
            }`}
            onClick={handleMarkComplete}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {currentLessonStatus === "completed" ? "Completed" : "Mark as Completed"}
          </Button>

          <div className="ml-auto flex items-center gap-2.5">
            <Button
              variant="outline"
              className="border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              onClick={handleNext}
              disabled={currentLessonIndex === lessons.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {videoMaterial && (
              <Button
                className="bg-[#1F4842] text-white hover:bg-[#17352e]"
                onClick={handleStartLesson}
              >
                <Play className="w-4 h-4 mr-1.5" />
                {hasStarted ? "Resume" : "Start"}
              </Button>
            )}
          </div>
        </div>

        {/* Course description */}
        {selectedLesson.objective && (
          <div>
            <h3 className="mb-1.5 text-base font-medium text-gray-900">
              {course.title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-500">
              {formatDescription(selectedLesson.objective)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}