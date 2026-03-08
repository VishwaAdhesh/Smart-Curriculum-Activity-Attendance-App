# SHI – Smart Curriculum Activity & Attendance App

SHI is a **full-stack MERN application** designed to help educational institutions manage **student attendance, curriculum activities, and performance analytics** through a modern web dashboard.

The system provides separate dashboards for **students, teachers, and administrators**, enabling efficient tracking of attendance, academic activities, and course progress.

---

# 🚀 Features

### 👨‍🎓 Student Features

* View attendance records
* Track curriculum activities
* Monitor academic performance
* Receive notifications

### 👨‍🏫 Teacher Features

* Mark student attendance
* Manage curriculum activities
* Track student participation
* Monitor attendance statistics

### 🛠 Admin Features

* Manage students and teachers
* Manage courses
* View attendance analytics
* Monitor system activity

### 📊 Analytics

* Attendance statistics
* Performance insights
* Interactive charts using Chart.js

---

# 🏗 System Architecture

Frontend → Backend → Database

React (Vite + Tailwind CSS)
⬇
Node.js + Express API
⬇
MongoDB Atlas

---

# 🧰 Tech Stack

### Frontend

* React
* Tailwind CSS
* Axios
* Chart.js

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt password hashing

### Development Tools

* VS Code
* Git & GitHub
* MongoDB Atlas

---

# 📁 Project Structure

```
SHI
│
├── backend
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   │
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   │   └── api.js
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙ Installation & Setup

## 1️⃣ Clone the Repository

```
git clone https://github.com/yourusername/shi-app.git
cd shi-app
```

---

# 🖥 Backend Setup

Navigate to backend folder:

```
cd backend
```

Install dependencies:

```
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend server:

```
node server.js
```

Backend will run on:

```
http://localhost:5000
```

Test health endpoint:

```
http://localhost:5000/api/health
```

---

# 🌐 Frontend Setup

Navigate to frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

# 🔗 Frontend–Backend Connection

Frontend communicates with backend using **Axios**.

Example API configuration:

```
frontend/src/services/api.js
```

```
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export default API;
```

---

# 🔒 Authentication

The system uses **JWT-based authentication**.

Features include:

* Secure login
* Password hashing using bcrypt
* Token-based session management

---

# 📊 Example API Endpoint

Health Check:

```
GET /api/health
```

Response:

```
{
  "status": "success",
  "message": "SHI API is running"
}
```

---

# 📈 Future Enhancements

* QR code attendance system
* Face recognition attendance
* AI-based attendance prediction
* Mobile application
* Email notification system

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

# 📄 License

This project is open-source and available under the **MIT License**.

---

# 👨‍💻 Author

Developed by **Vishwa Adhesh**

GitHub:
https://github.com/yourusername
