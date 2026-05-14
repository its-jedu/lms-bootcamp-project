from .assignments import (
    CourseAssignmentCreateSerializer,
    AssignedCoursesSerializer,
    CourseAssignmentSerializer,
)

from .courses import CourseSerializer, CourseUpdateSerializer
from .lessons import LessonSerializer
from .materials import (
    FILE_TYPE,
    ALLOWED_VIDEO_HOSTS,
    FileMaterialUploadSerializer,
    MaterialSerializer,
    TextMeterialSerializer,
    VideoMeterialSerializer
)