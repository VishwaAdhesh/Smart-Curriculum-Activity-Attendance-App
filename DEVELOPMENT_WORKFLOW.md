# SHI - Smart Curriculum Activity & Attendance App

## Step-by-Step Development Workflow

---

### Phase 1: Project Setup (Week 1)

#### Step 1.1: Initialize Backend

```bash
# Create project directory
mkdir shi-backend
cd shi-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-validator

# Install dev dependencies
npm install --save-dev nodemon
```

#### Step 1.2: Initialize Frontend

```bash
# Go back to root
cd ..

# Create React app with Vite
npm create vite@latest shi-frontend -- --template react

# Go to frontend directory
cd shi-frontend

# Install dependencies
npm install

# Install additional dependencies
npm install axios react-router-dom chart.js react-chartjs-2

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### Phase 2: Backend Development (Week 2-3)

#### Step 2.1: Set Up MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service
3. Create database: `shi_db`

#### Step 2.2: Configure Environment

Create `.env` file in backend:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shi_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Step 2.3: Run Backend

```bash
cd backend
npm run dev
```

---

### Phase 3: Frontend Development (Week 3-4)

#### Step 3.1: Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};
```

Update `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 3.2: Run Frontend

```bash
cd frontend
npm run dev
```

---

### Phase 4: Integration & Testing (Week 5)

#### Step 4.1: Connect Frontend to Backend

1. Update API URLs in frontend
2. Test all endpoints
3. Implement error handling

#### Step 4.2: Test Authentication

1. Register test users
2. Login with different roles
3. Test protected routes

---

### Phase 5: Deployment (Week 6)

#### Backend Deployment (Render/Heroku)

1. Create `Procfile`: `web: node server.js`
2. Set environment variables in deployment platform
3. Deploy and test

#### Frontend Deployment (Vercel/Netlify)

1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

---

## Project Structure Summary

```
SHI/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── courseController.js
│   │   ├── attendanceController.js
│   │   ├── activityController.js
│   │   ├── analyticsController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Course.js
│   │   ├── Attendance.js
│   │   ├── Activity.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── notificationRoutes.js
│   ├── package.json
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AttendanceManagement.jsx
│   │   │   ├── ActivityTracker.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── PROJECT_PLAN.md
├── DEVELOPMENT_WORKFLOW.md
└── TODO.md
```

---

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers

- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Attendance

- `GET /api/attendance` - Get all attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/course/:courseId` - Get course attendance

### Activities

- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Analytics

- `GET /api/analytics/attendance/:courseId` - Course attendance analytics
- `GET /api/analytics/performance/:studentId` - Student performance
- `GET /api/analytics/overview` - System overview

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

---

## Database Relationships

```
Students ←──────────────> Courses ←──────────────> Teachers
    │                       │                       │
    └──────────> Attendance <───────────────────────┘
                      │
                      ↓
                  Activities
```

---

## Running the Project

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

---

**End of Development Workflow**
