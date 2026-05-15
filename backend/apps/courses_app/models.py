from django.db import models

class Course(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    # created_by = models.ForeignKey(
    #     "auth_app.User",
    #     on_delete=models.CASCADE,
    #     related_name="created_courses",
    # )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "courses"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    title = models.CharField(max_length=255)
    objective = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lessons"
        ordering = ["order", "created_at"]
    
    def __str__(self):
        return self.title

class LessonProgress(models.Model):
    STATUS_CHOICES = [
        ("not_done", "Not Done"),
        ("done", "Done"),
    ]

    employee = models.ForeignKey(
        "auth_app.User",
        on_delete=models.CASCADE,
        related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="progress_records"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="not_done",
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lesson_progress"
        unique_together = ("employee", "lesson")

    def __str__(self):
        return f"{self.employee.email} -> {self.lesson.title} ({self.status})"

class Material(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ("pdf", "PDF"),
        ("audio", "AUDIO"),
        ("text", "TEXT"),
        ("video", "VIDEO"),        
    ]

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="materials"
    )
    
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES)
    # file = models. FileField(upload_to="course_material/")
    filename = models.CharField(max_length=255, blank=True, default="")
    storage_provider = models.CharField(max_length=50, default="cloudinary")
    provider_file_id = models.CharField(max_length=255, blank=True, default="")
    provider_path = models.CharField(max_length=500, blank=True, default="")
    text_content = models.TextField(blank=True, default="")
    video_url = models.URLField(blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lesson_materials"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.filename

class CourseAssignment(models.Model):
    PROGRESS_STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    employee = models.ForeignKey(
        "auth_app.User",
        on_delete=models.CASCADE,
        related_name="course_assignments"
    )
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="employee_assignments"
    )

    progress_status = models.CharField(
        max_length=20,
        choices=PROGRESS_STATUS_CHOICES,
        default="not_started",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "course_assignments"
        unique_together = ("employee", "course")
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.employee.email} -> {self.course.title}"