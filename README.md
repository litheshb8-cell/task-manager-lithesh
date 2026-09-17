# TaskFlow – Smart Task Management & Daily Productivity Dashboard

TaskFlow is a modern, full-stack web application designed to help individuals plan, organize, track, and complete their daily tasks. It features an ultra-sleek dark glassmorphic interface, an interactive floating cursor, ambient particle physics, drag-and-drop Kanban workflow, focus-oriented "My Day" routines, and rich visual analytics.

---

## 🚀 Key Features

1. **Productivity Dashboard**:
   - Dynamic greetings (*"Good Morning, Lithesh 👋"*).
   - High-impact Stat Cards: **Total Tasks (12)**, **Completed (7)**, **Pending (5)**, **Overdue (2)**.
   - **Daily Progress Circular Gauge** showing real-time completion percentage with animated SVG dial.
   - **🔥 Daily Streak** tracking (e.g. 5-Day Streak).
   - **7-Day Weekly Productivity Bar Chart** displaying performance across Monday through Sunday.
   - Quick interactive checklist for today's tasks with instant strikethrough.

2. **Full Task CRUD**:
   - **Create**: Add tasks with Title, Description, Priority (High 🔴, Medium 🟡, Low 🟢), Category, Due Date, and Status.
   - **Read**: Switch effortlessly between **Table View** and **Card Grid View**.
   - **Update**: Edit details, change status inline, or cycle from Pending ➔ In Progress ➔ Completed.
   - **Delete**: Confirmation modal with safeguard verification.
   - **Search & Filter**: Real-time fuzzy search and quick filters (*All, Pending, In Progress, Completed, High Priority, Today's Tasks, Category filters*).

3. **Interactive Drag & Drop Kanban Board**:
   - Move task cards smoothly between `Pending`, `In Progress`, and `Completed` columns.
   - Real-time column task counters.
   - Dropping tasks into `Completed` triggers celebratory confetti!

4. **"My Day" Focus View**:
   - Dedicated clean space displaying the current date (e.g. *Thursday, Sep 17, 2026*).
   - Day progress bar.
   - Quick inline task input to instantly add today's objectives.

5. **Interactive Calendar View**:
   - Monthly calendar navigation highlighting days with scheduled tasks.
   - Color-coded priority task pills.

6. **Modern Aesthetics & Interactive Environment**:
   - **Dark Theme** with glowing neon accents and glassmorphism.
   - **Light / Dark Mode Toggle** with saved user preference.
   - **Fluid Floating Cursor**: Dual-element cursor with a precise dot and an ambient trailing ring follower using linear interpolation (lerp).
   - **Ambient Particle Mesh Canvas**: Background nodes gently interact with mouse movement.
   - **Notification Center**: Bell icon alerting overdue and due-today tasks.
   - **Toast Notifications & Confetti**: Immediate feedback on every user action.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Modern CSS3 (Glassmorphism, CSS Variables, Responsive Grid), Vanilla JavaScript (ES6+ modular architecture).
- **Backend**: Node.js, Express.js.
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing.
- **Database**: Dual-engine architecture:
  - Supports standard **MongoDB** via Mongoose.
  - Automatically activates a zero-configuration persistent JSON file store (`backend/data/store.json`) if MongoDB is not running locally.
- **Testing**: Built-in automated API test script (`npm test`).

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & fallback detection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me profile
│   │   ├── taskController.js     # Task CRUD & query filters
│   │   └── statsController.js    # Progress, streak, weekly charts
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT token verification
│   ├── models/
│   │   ├── User.js               # User model & dual persistence
│   │   └── Task.js               # Task model & dual persistence
│   ├── data/
│   │   ├── seedData.js           # Seed data generator for Lithesh
│   │   └── store.js              # Robust persistent local file store
│   └── server.js                 # Express server & static asset host
├── frontend/
│   ├── index.html                # Main single-page application entry
│   ├── css/
│   │   ├── style.css             # Main theme, glassmorphism, typography
│   │   ├── cursor.css            # Floating cursor follower & particle FX
│   │   └── kanban.css            # Drag-and-drop Kanban styles
│   └── js/
│       ├── api.js                # REST API client & JWT storage
│       ├── cursor.js             # Interactive floating cursor & canvas
│       ├── dashboard.js          # Circular dial, stats, weekly chart
│       ├── tasks.js              # CRUD, table/grid, filter pills, search
│       ├── kanban.js             # HTML5 drag-and-drop board
│       ├── myday.js              # My Day focused daily routine
│       ├── calendar.js           # Interactive monthly calendar
│       └── app.js                # Router, theme toggle, toasts, confetti
├── scripts/
│   └── test-api.js               # Automated REST API verification suite
├── package.json
├── .env.example
├── .env
└── README.md
```

---

## ⚡ Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm start
```
The server will start at **`http://localhost:5000`**.

### 3. Open in Browser
Visit **`http://localhost:5000`** in your browser.

### 4. Pre-configured Demo Account
- **Email**: `lithesh@example.com`
- **Password**: `password123`
*(Or click the **"⚡ 1-Click Demo Login (Lithesh)"** button on the login screen).*

---

## 🧪 Running Automated Tests

To test all REST API endpoints (auth, task creation, update, delete, stats):
```bash
npm test
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/tasks` | Get all tasks (supports filters) | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `GET` | `/api/tasks/:id` | Get task details by ID | Yes |
| `PUT` | `/api/tasks/:id` | Update task details or status | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task by ID | Yes |
| `GET` | `/api/stats/dashboard` | Computed dashboard statistics | Yes |
| `GET` | `/api/health` | Server health and status check | No |
