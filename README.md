# LMS Bootcamp Project

This is a fullstack Learning Management System (LMS) built with:

- **Frontend:** React (Vite) + Shadcn UI (JSX)
- **Backend:** Django + Django REST Framework (DRF)

---

## Project Structure

```
project-root/
├── backend/   # Django API
├── frontend/  # React App (Vite + Shadcn)
```

---

## Clone the Repository

```bash
git clone https://github.com/Wepply-Stack/lms-bootcamp-project.git
cd lms-bootcamp-project
```

---

## Branching Strategy

Each team member should work on their own branch.

### 🔹 Frontend Developers

```bash
git checkout -b frontend/your-name
```

### 🔹 Backend Developers

```bash
git checkout -b backend/your-name
```

### Example

```bash
git checkout -b frontend/john
git checkout -b backend/jane
```

---

## Prerequisites

Make sure you have installed:

- Node.js (**v18, v20 recommended** | v22 works with limitations)
- Python (3.10+)
- pip / virtualenv

---

# Backend Setup (Django DRF)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # MacOS
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Backend runs on:
http://127.0.0.1:8000

---

# Frontend Setup (React + Vite + Shadcn)

## Step 1: Navigate to frontend

```bash
cd frontend
```

---

## Step 2: Install dependencies

```bash
npm install
```

---

## Step 3: Tailwind CSS Setup (IMPORTANT)

If not already configured:

```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npx tailwindcss init -p
```

### Update `tailwind.config.js`

```
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### Update `src/index.css`

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 4: Setup Import Alias

Create `jsconfig.json`:

```
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Step 5: Initialize Shadcn UI

```bash
npx shadcn@latest init
```

---

## Step 6: Install Components

⚠️ If using Node v22:
**DO NOT use `--all`**

Instead install manually:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

---

## Step 7: Run Frontend

```bash
npm run dev
```

Frontend runs on:
http://localhost:5173

---

## Connecting Frontend & Backend

Make sure Django allows CORS in `config/settings.py`:

```
CORS_ALLOW_ALL_ORIGINS = True
```

API base URL:

```
http://127.0.0.1:8000/
```

---

## Tech Stack

- React (Vite)
- Tailwind CSS
- Shadcn UI (Radix)
- Django
- Django REST Framework

---

## Notes

- Node v22 works but has limitations with some CLI tools
- Use Node v18/v20 for best compatibility
- Always install only needed components in Shadcn

---

## Basic Git Workflow

```bash
# Pull latest changes
git pull origin main

# Create your branch
git checkout -b frontend/your-name

# Add changes
git add .

# Commit
git commit -m "your message"

# Push branch
git push origin your-branch-name
```

# API Endpoints Documentation

API base URL for local development:

```text
http://127.0.0.1:8000/
```

Most protected endpoints require:

```http
Authorization: Bearer <access_token>
```

## Authentication

<details>
<summary><strong>POST /api/auth/login/</strong> - Login</summary>

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "adminpass123"
}
```

**Response (200 OK):**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2026-04-08T10:00:00Z"
  }
}
```

</details>

<details>
<summary><strong>POST /api/auth/forgot-password/</strong> - Request Password Reset</summary>

**Request:**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset link generated",
  "reset_link": "http://localhost:5173/reset-password?token=abc123xyz",
  "token": "abc123xyz"
}
```

</details>

<details>
<summary><strong>POST /api/auth/reset-password/</strong> - Reset Password</summary>

**Request:**

```json
{
  "token": "abc123xyz",
  "new_password": "NewStrong@123",
  "confirm_password": "NewStrong@123"
}
```

**Response (200 OK):**

```json
{
  "message": "Password reset successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "confirm_password": ["Passwords do not match"]
}
```

</details>

---

## Admin Endpoints

<details>
<summary><strong>GET /api/admin/dashboard/</strong> - Admin Dashboard</summary>

**Requires:** `role=admin`

**Response (200 OK):**

```json
{
  "total_courses": 5,
  "total_employees": 12,
  "total_assignments": 0
}
```

</details>

<details>
<summary><strong>GET /api/users/</strong> - List All Users</summary>

**Requires:** `role=admin`

**Response (200 OK):**

```json
[
  {
    "id": 2,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "position": "Developer",
    "role": "employee",
    "created_at": "2026-04-08T10:00:00Z"
  }
]
```

</details>

<details>
<summary><strong>POST /api/admin/employees/</strong> - Create Employee</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response (201 Created):**

```json
{
  "id": 4,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "employee",
  "generated_password": "aB3$xY9@",
  "message": "Employee created successfully. Password is: aB3$xY9@"
}
```

</details>

<details>
<summary><strong>GET /api/admin/employees/list/</strong> - List Employees</summary>

**Requires:** `role=admin`

Returns employees for admin selection and management.

</details>

<details>
<summary><strong>DELETE /api/admin/employees/delete/</strong> - Bulk Delete Employees</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "employee_ids": [2, 3]
}
```

</details>

<details>
<summary><strong>POST /api/admin/course-assignments/</strong> - Assign Courses</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "employee_ids": [2, 3],
  "course_ids": [1]
}
```

**Response (201 Created):**

```json
{
  "message": "Course assignment processed successfully.",
  "created_count": 2
}
```

**Notes:**

- Employees must exist, be active, and have `role=employee`.
- Courses must exist and be `published`.
- Duplicate assignments are skipped; if all requested assignments already exist, the endpoint returns `409 Conflict`.

</details>

<details>
<summary><strong>GET /api/admin/course-assignments/</strong> - List Course Assignments</summary>

**Requires:** `role=admin`

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "employee_id": 2,
    "employee_email": "employee@example.com",
    "course_id": 1,
    "course_title": "Python Basics",
    "progress_status": "not_started",
    "assigned_at": "2026-04-08T10:00:00Z",
    "started_at": null,
    "completed_at": null,
    "is_active": true
  }
]
```

</details>

---

## Course Endpoints

<details>
<summary><strong>GET /api/courses/</strong> - List Courses</summary>

**Requires:** authenticated user

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Python Basics",
    "description": "Learn Python programming",
    "status": "draft",
    "created_at": "2026-04-08T10:00:00Z",
    "updated_at": "2026-04-08T10:00:00Z"
  }
]
```

**Notes:**

- Admin users can view all courses.
- Employee users can view published courses.

</details>

<details>
<summary><strong>POST /api/courses/</strong> - Create Course</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "title": "Advanced Django",
  "description": "Master Django advanced concepts"
}
```

**Response (201 Created):**

```json
{
  "id": 3,
  "title": "Advanced Django",
  "description": "Master Django advanced concepts",
  "status": "draft",
  "created_at": "2026-04-08T12:00:00Z",
  "updated_at": "2026-04-08T12:00:00Z"
}
```

**Notes:**

- New courses are created as `draft` by default.

</details>

<details>
<summary><strong>GET /api/courses/{course_id}/</strong> - Retrieve Course</summary>

**Requires:** authenticated user

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Python Basics",
  "description": "Learn Python programming",
  "status": "draft",
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T10:00:00Z"
}
```

**Notes:**

- Admin users can retrieve draft or published courses.
- Employee users can retrieve published courses.

</details>

<details>
<summary><strong>PATCH /api/courses/{course_id}/</strong> - Update Draft Course</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "title": "Updated Course Title",
  "description": "Updated course description"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Updated Course Title",
  "description": "Updated course description",
  "status": "draft",
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T12:00:00Z"
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "Published courses are view only."
}
```

**Notes:**

- Only `draft` courses can be updated.
- `published` courses are view-only for MVP.
- Course status cannot be changed through this endpoint.
- Use `PATCH /api/courses/{course_id}/publish/` to publish a draft course.

</details>

<details>
<summary><strong>PATCH /api/courses/{course_id}/publish/</strong> - Publish Course</summary>

**Requires:** `role=admin`

Publishes a draft course.

**Notes:**

- Course status transition is one-way for MVP: `draft` -> `published`.
- Published courses cannot be reverted back to `draft`.
- Published courses remain view-only.

</details>

<details>
<summary><strong>DELETE /api/courses/{course_id}/</strong> - Delete Draft Course</summary>

**Requires:** `role=admin`

**Response:** `204 No Content`

**Error Response (409 Conflict):**

```json
{
  "error": "Published courses are protected from deletion."
}
```

**Notes:**

- Only `draft` courses can be deleted.
- `published` courses are protected from deletion.

</details>

---

## Lesson Endpoints

<details>
<summary><strong>GET /api/courses/{course_id}/lessons/</strong> - List Course Lessons</summary>

**Requires:** authenticated user

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "course": 3,
    "title": "Introduction to Python",
    "objective": "Understand the course structure",
    "order": 1,
    "created_at": "2026-04-08T10:00:00Z",
    "updated_at": "2026-04-08T10:00:00Z"
  },
  {
    "id": 2,
    "course": 3,
    "title": "Data Analysis",
    "objective": "Handle and analyze data",
    "order": 2,
    "created_at": "2026-04-08T10:10:00Z",
    "updated_at": "2026-04-08T10:10:00Z"
  }
]
```

**Notes:**

- Lessons are returned in ascending `order`.
- Admin users can view lessons for draft and published courses.
- Employee users can only view lessons for published courses assigned to them.

</details>

<details>
<summary><strong>GET /api/courses/{course_id}/lessons/{lesson_id}/</strong> - Retrieve Lesson with Navigation</summary>

**Requires:** authenticated user

**Response (200 OK):**

```json
{
  "id": 5,
  "course": 4,
  "title": "Lesson Two",
  "objective": "Second lesson",
  "order": 2,
  "created_at": "2026-05-10T10:00:00Z",
  "updated_at": "2026-05-10T10:00:00Z",
  "previous_lesson": {
    "id": 4,
    "title": "Lesson One",
    "order": 1
  },
  "next_lesson": {
    "id": 6,
    "title": "Lesson Three",
    "order": 3
  },
  "can_go_previous": true,
  "can_go_next": true
}
```

**Boundary behavior:**

First lesson:

```json
{
  "previous_lesson": null,
  "can_go_previous": false
}
```

Last lesson:

```json
{
  "next_lesson": null,
  "can_go_next": false
}
```

**Frontend handoff:**

- Use `previous_lesson.id` for the Previous button target.
- Use `next_lesson.id` for the Next button target.
- Disable Previous when `can_go_previous` is `false` or `previous_lesson` is `null`.
- Disable Next when `can_go_next` is `false` or `next_lesson` is `null`.

**Notes:**

- Navigation follows lesson `order`.
- Admin users can retrieve lessons from draft or published courses.
- Employee users can only retrieve lessons for published courses assigned to them.
- Returns `403 Forbidden` if an employee is not assigned to the course.
- Returns `404 Not Found` if the lesson does not belong to the course.

</details>

<details>
<summary><strong>POST /api/courses/{course_id}/lessons/</strong> - Create Lesson</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "title": "Introduction",
  "objective": "Understand the course structure"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "course": 3,
  "title": "Introduction",
  "objective": "Understand the course structure",
  "order": 1,
  "created_at": "2026-04-08T10:00:00Z",
  "updated_at": "2026-04-08T10:00:00Z"
}
```

**Notes:**

- `order` is assigned automatically.
- New lessons are added to the end of the course.
- Only `draft` courses can have lessons created.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>PATCH /api/courses/{course_id}/lessons/{lesson_id}/</strong> - Update Lesson</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "title": "Updated Lesson Title",
  "objective": "Updated learning objective"
}
```

**Notes:**

- Only lessons in `draft` courses can be updated.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>DELETE /api/courses/{course_id}/lessons/{lesson_id}/</strong> - Delete Lesson</summary>

**Requires:** `role=admin`

**Response:** `204 No Content`

**Notes:**

- Only lessons in `draft` courses can be deleted.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>PATCH /api/courses/{course_id}/lessons/reorder/</strong> - Reorder Lessons</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "lesson_ids": [3, 1, 2]
}
```

**Response (200 OK):**

```json
[
  {
    "id": 3,
    "course": 3,
    "title": "Final Quiz",
    "objective": "",
    "order": 1,
    "created_at": "2026-04-08T10:30:00Z",
    "updated_at": "2026-04-08T11:00:00Z"
  }
]
```

**Notes:**

- Send `lesson_ids` in the desired display order.
- Duplicate lesson IDs are not allowed.
- All lesson IDs must belong to the selected course.
- Only lessons in `draft` courses can be reordered.
- Published courses are view-only and return `409 Conflict`.

</details>

---

## Material Endpoints

<details>
<summary><strong>GET /api/lessons/{lesson_id}/materials/</strong> - List Lesson Materials</summary>

**Requires:** authenticated user

**Notes:**

- Admin users can view materials for any lesson.
- Employee users can only view materials for assigned published courses.

</details>

<details>
<summary><strong>POST /api/lessons/{lesson_id}/materials/file/</strong> - Upload File Material</summary>

**Requires:** `role=admin`

Accepts multipart file uploads for supported PDF and audio files.

**Notes:**

- Only lessons in `draft` courses can have file materials uploaded.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>POST /api/lessons/{lesson_id}/materials/text/</strong> - Create Text Material</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "text_content": "Lesson notes go here"
}
```

**Notes:**

- Only lessons in `draft` courses can have text materials created.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>POST /api/lessons/{lesson_id}/materials/video/</strong> - Create Video Material</summary>

**Requires:** `role=admin`

**Request:**

```json
{
  "video_url": "https://www.youtube.com/watch?v=abc123"
}
```

**Notes:**

- Supported video providers: YouTube and Vimeo.
- Only lessons in `draft` courses can have video materials created.
- Published courses are view-only and return `409 Conflict`.

</details>

<details>
<summary><strong>DELETE /api/lessons/{lesson_id}/materials/{material_id}/</strong> - Delete Material</summary>

**Requires:** `role=admin`

**Notes:**

- Only materials in `draft` courses can be deleted.
- Published courses are view-only and return `409 Conflict`.

</details>

---

## Employee Endpoints

<details>
<summary><strong>GET /api/employee/assigned-courses/</strong> - My Assigned Courses</summary>

**Requires:** `role=employee`

**Response (200 OK):**

```json
[
  {
    "assignment_id": 1,
    "course_id": 4,
    "title": "Story 12 Test Course",
    "description": "Course for testing lesson navigation",
    "progress_status": "not_started",
    "assigned_at": "2026-05-10T10:00:00Z",
    "started_at": null,
    "completed_at": null
  }
]
```

</details>

<details>
<summary><strong>GET /api/employee/profile/</strong> - Get Employee Profile</summary>

**Requires:** `role=employee`

**Response (200 OK):**

```json
{
  "id": 2,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "position": "Software Developer",
  "role": "employee",
  "created_at": "2026-04-08T10:00:00Z"
}
```

</details>

<details>
<summary><strong>PUT /api/employee/profile/</strong> - Update Employee Profile</summary>

**Requires:** `role=employee`

**Request:**

```json
{
  "first_name": "Jonathan",
  "phone_number": "+9876543210",
  "position": "Senior Software Developer"
}
```

</details>

<details>
<summary><strong>POST /api/employee/change-password/</strong> - Change Employee Password</summary>

**Requires:** `role=employee`

**Request:**

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewStrong@123"
}
```

</details>

---

## Error Responses

### 401 Unauthorized (Invalid/No Token)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden (Wrong Role)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 422 Unprocessable Entity (Validation Error)

```json
{
  "email": ["User with this email already exists"],
  "name": ["Please provide both first and last name"]
}
```

## STATUS CODES SUMMARY

| Status | Description        |
| ------ | ------------------ |
| 200    | Success (GET, PUT) |
| 201    | Created (POST)     |
| 400    | Bad Request        |
| 401    | Unauthorized       |
| 403    | Forbidden          |
| 404    | Not Found          |
| 422    | Validation Error   |
