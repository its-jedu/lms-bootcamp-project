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

## AUTHENTICATION

### 1. Login (Shared)

**Endpoint:** `POST /api/auth/login`

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

### 2. Forgot Password (Request Reset Link)

**Endpoint:** `POST /api/auth/forgot-password`

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

### 3. Reset Password (With Token)

**Endpoint:** `POST /api/auth/reset-password`

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

---

## ADMIN ENDPOINTS (Requires role=admin)

### 4. Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "total_courses": 5,
  "total_employees": 12,
  "total_assignments": 0
}
```

### 5. List All Employees

**Endpoint:** `GET /api/users`

**Headers:**

```
Authorization: Bearer <access_token>
```

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
  },
  {
    "id": 3,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone_number": "+1987654321",
    "position": "Designer",
    "role": "employee",
    "created_at": "2026-04-08T11:00:00Z"
  }
]
```

### 6. Create Employee

**Endpoint:** `POST /api/admin/employees`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

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

**Error Response (422 Unprocessable Entity):**

```json
{
  "email": ["User with this email already exists"],
  "name": ["Please provide both first and last name"]
}
```

### 7. List All Courses

**Endpoint:** `GET /api/courses/`

**Headers:**

```
Authorization: Bearer <access_token>
```

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
  },
  {
    "id": 2,
    "title": "Django REST Framework",
    "description": "Build APIs with DRF",
    "status": "draft",
    "created_at": "2026-04-08T11:00:00Z",
    "updated_at": "2026-04-08T11:00:00Z"
  }
]
```

### 8. Create Course

**Endpoint:** `POST /api/courses/`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

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

**Error Response (422 Unprocessable Entity):**

```json
{
  "title": ["This field is required"]
}
```

---

## EMPLOYEE ENDPOINTS (Requires role=employee)

### 9. Get Employee Profile

**Endpoint:** `GET /api/employee/profile`

**Headers:**

```
Authorization: Bearer <access_token>
```

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

### 10. Update Employee Profile

**Endpoint:** `PUT /api/employee/profile`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request (Partial update allowed):**

```json
{
  "first_name": "Jonathan",
  "phone_number": "+9876543210",
  "position": "Senior Software Developer"
}
```

**Response (200 OK):**

```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": 2,
    "first_name": "Jonathan",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+9876543210",
    "position": "Senior Software Developer",
    "role": "employee",
    "created_at": "2026-04-08T10:00:00Z"
  }
}
```

### 11. Change Employee Password

**Endpoint:** `POST /api/employee/change-password`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**

```json
{
  "current_password": "DOE",
  "new_password": "NewStrong@123"
}
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "current_password": ["Wrong password"]
}
```

---

## ERROR RESPONSES

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
