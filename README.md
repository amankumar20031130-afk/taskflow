# TaskFlow - Real-time Task Management Application

TaskFlow is a robust, real-time task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). It features secure authentication, real-time collaboration updates, and a modern, responsive user interface.

## 🚀 Features

*   **Task Management**: Create, Read, Update, and Delete tasks with ease.
*   **Real-time Collaboration**: Instant updates across all connected clients when tasks are created, updated, or deleted.
*   **User Assignment**: Assign tasks to other users and receive real-time notifications.
*   **Personalized Dashboard**: Filter tasks by "All", "Assigned to Me", "Created by Me", and "Overdue".
*   **Smart Filtering**: Filter by Status and Priority; Sort by Due Date.
*   **Optimistic UI**: Experience zero-latency UI updates for task completions.
*   **Audit Logging**: Tracks status changes for accountability.
*   **Authentication**: Secure JWT-based auth with HTTP-only cookies.

---

## 🛠️ Setup Instructions

### 1. Docker Setup (Recommended)
You can spin up the entire stack (Frontend, Backend, Database) with a single command.

```bash
# In the root directory
docker-compose up --build
```

The app will be available at:
*   **Frontend**: `http://localhost:80`
*   **Backend**: `http://localhost:5000`

### 2. Manual Local Setup

**Prerequisites:** Node.js (v16+), MongoDB running locally.

#### Backend
1.  Navigate to `backend/`: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/taskflow
    JWT_SECRET=your_super_secret_key_change_this
    CLIENT_URL=http://localhost:5173
    ```
4.  Run server: `npm run dev`

#### Frontend
1.  Navigate to `frontend/`: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run dev server: `npm run dev`
4.  Open `http://localhost:5173`

---

## 📚 API Contract & Documentation

### Authentication
*   `POST /api/auth/signup`: Register a new user.
*   `POST /api/auth/login`: Login and receive JWT cookie.
*   `POST /api/auth/logout`: Logout user.
*   `GET /api/auth/me`: Get current authenticated user profile.

### Tasks
*   `GET /api/tasks`: Fetch tasks. Supports query params: `status`, `priority`, `sortBy`, `view` (assigned, created, overdue).
*   `POST /api/tasks`: Create a new task.
*   `PUT /api/tasks/:id`: Update a task (title, status, assignee, etc.).
*   `DELETE /api/tasks/:id`: Delete a task.

### Notifications
*   `GET /api/notifications`: Get user notifications.
*   `PATCH /api/notifications/:id/read`: Mark notification as read.

---

## 🏗️ Architecture & Design Decisions

### 1. Layered Architecture (Backend)
I adopted a strict separation of concerns to ensure scalability and maintainability:
*   **Controllers**: Handle HTTP requests, parsing, and validation (using Zod DTOs).
*   **Services**: Contain pure business logic (e.g., "Status X can only change to Y", emitting Socket events).
*   **Repositories**: Handle direct calls to the MongoDB database.
*   **Models**: Mongoose schemas defining the data structure.

### 2. Database Choice: MongoDB
I chose MongoDB for its flexibility with document schemas, which fits the varying nature of task metadata. The application uses Mongoose for strong typing and validation at the schema level.

### 3. Authentication: JWT with HttpOnly Cookies
Instead of storing tokens in LocalStorage (vulnerable to XSS), the application uses **HttpOnly, Secure Cookies**.
*   The Backend sets the `jwt` cookie upon login.
*   The Frontend credentials (`include`) ensure this cookie is sent with every API request.
*   Middleware verifies the token before access is granted to protected routes.

### 4. Real-time Integration: Socket.io
**Socket.io** is used to bridge the gap between clients.
*   **Global Room**: For general task updates (created/deleted), ensuring everyone sees the latest board state.
*   **User Rooms (`socket.join(userId)`)**: Specific rooms for private events, like "You have been assigned a task".
*   **Frontend Hook**: A custom `useSocket` hook manages the connection and event listeners, automatically triggering React Query `refetch` or showing Toasts upon events.

### 5. Optimistic UI
For task status updates (e.g., ticking a checkbox), we don't wait for the server. We immediately update the UI cache. If the server request fails, we roll back to the previous state. This makes the app feel incredibly fast.

---

## ⚖️ Trade-offs & Assumptions

*   **State Management**: React Query is used for server state (tasks, user), while React Context handles global UI state (auth). Redux was deemed overkill for this complexity.
*   **Pagination**: Currently, the `getTasks` endpoint returns all matching tasks. In a production environment with thousands of tasks, pagination (cursor-based) would be implemented.
*   **Security**: While HttpOnly cookies are secure, CSRF protection is currently handled via basic CORS settings. A production app would implement specific CSRF tokens.
*   **Audit Logging**: The audit log is currently stored in the same DB. For high-scale systems, this would likely be offloaded to a separate logging service or time-series DB.
