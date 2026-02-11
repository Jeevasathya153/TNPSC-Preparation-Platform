# TNPSC Exam Prep Application - Complete Project Documentation

## 📋 Project Overview

**Project Name:** TNPSC Exam Prep (Tamil Nadu Government Exam Preparation App)  
**Version:** 1.1.0  
**Type:** Full-Stack Progressive Web Application (PWA)  
**Purpose:** Help students prepare for Tamil Nadu Public Service Commission (TNPSC) exams with study materials, quizzes, and progress tracking.
**Latest Update:** Contest module + resilience polish (February 2026)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |

| Vite | 5.0.8 | Build Tool & Dev Server |
| React Router DOM | 6.20.0 | Client-side Routing |
| Tailwind CSS | 3.3.0 | Utility-first CSS Framework |
| Axios | 1.6.0 | HTTP Client |
| jsPDF | 3.0.4 | PDF Generation |
| IndexedDB | Native | Offline Storage |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17+ | Programming Language |
| Spring Boot | 3.2.0 | Backend Framework |
| Spring Security | 6.1.1 | Authentication & Authorization |
| Spring Data MongoDB | 4.2.0 | Database Integration |
| JWT (jjwt) | 0.12.3 | Token-based Authentication |
| Lombok | Latest | Boilerplate Reduction |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB | Primary Database (Users, Quizzes, Results, Progress) |
| IndexedDB | Client-side Offline Storage (PDFs, Books) |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| Maven | Backend Build & Dependency Management |
| npm | Frontend Package Manager |
| Service Worker | PWA & Offline Caching |

---

## 📁 Project Structure

```
tngov-exam-prep/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/tnexam/
│   │   ├── TnExamApplication.java    # Main Application Entry
│   │   ├── config/                   # Security, CORS, JWT Config
│   │   ├── controller/               # REST API Controllers
│   │   ├── model/                    # Entity Models
│   │   ├── repository/               # MongoDB Repositories
│   │   └── service/                  # Business Logic Services
│   └── pom.xml                       # Maven Dependencies
│
├── src/                              # React Frontend
│   ├── components/
│   │   ├── auth/                     # Authentication Components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── common/                   # Reusable UI Components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Toast.jsx
│   │   └── ErrorBoundary.jsx
│   │
│   ├── pages/                        # Page Components
│   │   ├── Dashboard.jsx             # Home Dashboard
│   │   ├── Books.jsx                 # Study Materials & PDFs
│   │   ├── PDFViewer.jsx             # PDF Reader
│   │   ├── OfflineBooks.jsx          # Offline Downloads Manager
│   │   ├── Quiz.jsx                  # Quiz Interface
│   │   ├── PracticeTest.jsx          # Practice Test Mode
│   │   ├── MyProgress.jsx            # Progress Tracking
│   │   ├── Subjects.jsx              # Subject Selection
│   │   ├── Profile.jsx               # User Profile
│   │   ├── Notifications.jsx         # User Notifications
│   │   └── AdminNotifications.jsx    # Admin Panel
│   │
│   ├── context/                      # React Context Providers
│   │   ├── AuthContext.jsx           # Authentication State
│   │   ├── ThemeContext.jsx          # Dark/Light Theme
│   │   └── LanguageContext.jsx       # Multi-language Support
│   │
│   ├── services/                     # API & Utility Services
│   │   ├── api.js                    # Axios API Client
│   │   ├── authService.js            # Auth Token Management
│   │   ├── pdfService.js             # Static PDF Data (52 PDFs)
│   │   ├── offlineStorage.js         # IndexedDB Operations
│   │   ├── storageService.js         # Local Storage Utils
│   │   └── translationService.js     # i18n Translations
│   │
│   ├── config/
│   │   ├── apiConfig.js              # API Configuration
│   │   ├── constants.js              # App Constants
│   │   └── themes.js                 # Theme Configuration
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useApi.js
│   │   └── useTranslate.js
│   │
│   └── utils/                        # Helper Functions
│       ├── helpers.js
│       └── validators.js
│
├── public/
│   ├── index.html
│   ├── manifest.json                 # PWA Manifest
│   ├── sw.js                         # Service Worker
│   └── icons/                        # App Icons
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## ✨ Features Implemented

### 1. 🔐 Authentication System
- **User Registration** with email validation
- **User Login** with JWT token authentication
- **Protected Routes** - Unauthorized users redirected to login
- **Session Management** using sessionStorage
- **Auto Logout** on browser close

### 2. 📚 Books & Study Materials
- **52 TNPSC Study Materials** from tnpscematerials.wordpress.com
  - 27 Study Materials (General Studies, Tamil, English, Science, History, etc.)
  - 25 Previous Year Question Papers
- **Category Filters** - Study Materials / Previous Year
- **Subject Filters** - All, Tamil, English, General Studies, History, Geography, etc.
- **Online PDF Viewing** using Google Docs Viewer
- **Offline Download** - Save PDFs to device for offline access
- **User-Specific Downloads** - Each user has their own offline library

### 3. 📖 PDF Viewer
- **In-app PDF Viewing** with Google Docs embedded viewer
- **Offline-First Loading** - Loads from IndexedDB if available
- **"Viewing Offline" Indicator** when viewing cached PDFs
- **Back to Books** navigation

### 4. 📝 Quiz System
- **Multiple Choice Questions** with 4 options
- **Subject-wise Quizzes** (TNPSC Group 1, 2, 4)
- **Timer-based Tests** with countdown
- **Instant Feedback** on answers
- **Score Calculation** with percentage
- **Results Storage** in MongoDB

### 5. 📊 Progress Tracking
- **Dashboard Statistics**
  - Total Quizzes Taken
  - Average Score
  - Subjects Covered
  - Available Resources Count
- **Topic-wise Progress** with percentage bars
- **Progress Chart** showing score trends
- **Download Progress Report** as professional PDF

### 6. 📱 Progressive Web App (PWA)
- **Installable** on mobile/desktop
- **Service Worker** for offline caching
- **App Manifest** with icons
- **Offline Support** for cached content

### 7. 🌙 Theme Support
- **Dark Mode** / Light Mode toggle
- **System Preference Detection**
- **Persistent Theme** across sessions

### 8. 🌐 Multi-Language Support
- **English** (default)
- **Tamil** (தமிழ்)
- **Translation Service** for dynamic content

### 9. 🔔 Notifications
- **User Notifications** for updates
- **Admin Notification Panel** for sending announcements
- **Read/Unread Status** tracking

### 10. 👤 User Profile
- **View Profile** information
- **Edit Profile** (name, email)
- **Logout** functionality

### 11. 🏆 Contest Challenges
- **Daily & Weekly Contests:** Time-boxed question sets (10–30 questions) refresh automatically with countdown timers, contest badges, and live progress bars.
- **Leaderboard & Stats:** Real-time leaderboard tiles, accuracy %, participant counts, and clean result cards pull directly from the backend for the active contest.
- **Attempt Tracking & Notifications:** Users get alerted inside the dashboard and are blocked from re-attempting until the next reset window while performance summaries (score, rank, time) stay visible.
- **Dashboard Integration:** Contest cards, modal, and quick access buttons on the dashboard surface contest participation, next reset time, and contextual calls-to-action.
- **Auto Contest Provisioning:** A MongoDB-backed scheduler (`update-contest.js`) plus backend `ContestService` logic ensure a contest instance exists for every new day/week before users join.

---

## 🆕 Recent Additions (Post-December 23, 2025)

- **Contest Module Launch:** Added a dedicated contest page plus dashboard modal for daily/weekly live contests, offering warm-up questions, animated timers, and leaderboard-ready score cards.
- **Leaderboard & Stats APIs:** The backend now exposes contest-specific endpoints for fetching active contests, leaderboards, participation checks, stats, and historical results that power real-time UX updates.
- **Auto-Provisioning Script:** `update-contest.js` keeps a fresh contest ready every day and week, complementing the `ContestService` scheduled job so users never load an empty contest slate.
- **Dashboard Intelligence:** Contest cards, next-reset timers, attempt notices, and the contest modal were woven into the Dashboard so users can jump into competitions without hunting for a separate screen.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | Get all quizzes |
| GET | `/api/quizzes/{id}` | Get quiz by ID |
| GET | `/api/quizzes/subject/{subject}` | Get quizzes by subject |
| POST | `/api/quizzes` | Create quiz |
| PUT | `/api/quizzes/{id}` | Update quiz |
| DELETE | `/api/quizzes/{id}` | Delete quiz |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results/user/{userId}` | Get user's results |
| POST | `/api/results` | Save quiz result |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/user/{userId}` | Get user progress |
| GET | `/api/progress/user/{userId}/topic-wise` | Get topic-wise progress |

### PDF Proxy
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pdf-proxy?url={pdfUrl}` | Proxy PDF for CORS |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/user/{userId}` | Get user notifications |
| POST | `/api/notifications` | Create notification |
| PUT | `/api/notifications/{id}/read` | Mark as read |

### Contests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contests/daily` | Get the currently active daily contest |
| GET | `/api/contests/weekly` | Get the currently active weekly contest |
| GET | `/api/contests/{contestId}` | Get contest metadata by ID |
| GET | `/api/contests/{contestId}/leaderboard` | Leaderboard for a contest |
| GET | `/api/contests/{contestId}/stats` | Contest statistics (participants, average score/time, high/low) |
| GET | `/api/contests/{contestId}/check-participation/{userId}` | Check if a user has attempted a contest and fetch the result |
| POST | `/api/contests/{contestId}/submit` | Submit contest answers and get immediate scoring |
| GET | `/api/contests/user/{userId}/history` | Fetch a user’s contest history |
| GET | `/api/contests/{contestId}/user/{userId}` | Get a specific user’s result for a contest |
| GET | `/api/contests/recent` | Get recent contests for archive viewing |
| GET | `/api/contests/type/daily` | List all daily contests (histories) |
| GET | `/api/contests/type/weekly` | List all weekly contests (histories) |
| POST | `/api/contests/create/daily` | Admin/testing endpoint to manually provision a daily contest |
| POST | `/api/contests/create/weekly` | Admin/testing endpoint to manually provision a weekly contest |

---

## 💾 Database Schema (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (USER/ADMIN),
  createdAt: Date,
  updatedAt: Date
}
```

### Quizzes Collection
```javascript
{
  _id: ObjectId,
  title: String,
  subject: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }
  ],
  duration: Number (minutes),
  createdAt: Date
}
```

### Results Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  score: Number,
  totalQuestions: Number,
  answers: [Number],
  timeTaken: Number,
  completedAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

---

## 📦 Offline Storage (IndexedDB)

### Database: `tngov_exam_prep` (Version 3)

### Books Store
```javascript
{
  id: String (userId_bookId),
  originalId: String,
  userId: String,
  title: String,
  subject: String,
  pdfUrl: String,
  downloadedAt: Date,
  size: Number
}
```

### PDFs Store
```javascript
{
  id: String (userId_bookId),
  bookId: String,
  userId: String,
  blob: Blob,
  savedAt: Date
}
```

**Key Feature:** User-specific storage - each user only sees their own downloads.

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- Java 17+
- MongoDB (running on localhost:27017)
- Maven

### Frontend
```bash
cd tngov-exam-prep
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd tngov-exam-prep/backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Build for Production
```bash
# Frontend
npm run build

# Backend
mvn clean package
java -jar target/tnexam-backend-1.0.0.jar
```

---

## 📊 PDF Resources Summary

### Study Materials (27 PDFs)
| Subject | Count |
|---------|-------|
| General Studies | 3 |
| General English | 1 |
| General Tamil | 1 |
| Tamil (6th-12th) | 7 |
| History | 3 |
| Geography | 2 |
| Civics | 2 |
| Science | 3 |
| Maths | 2 |
| Current Affairs | 3 |

### Previous Year Questions (25 PDFs)
- TNPSC Group 1 (2011-2019)
- TNPSC Group 2 (2011-2018)
- TNPSC Group 4 (2011-2019)

---

## 🔒 Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **Password Hashing** - BCrypt encryption
3. **CORS Configuration** - Controlled cross-origin access
4. **Protected Routes** - Frontend route guards
5. **Session Storage** - Clears on browser close
6. **User-Specific Data** - Isolated offline storage per user

---

## 📱 PWA Features

- ✅ Installable on Home Screen
- ✅ Offline-capable (cached assets + downloaded PDFs)
- ✅ App Icons (192x192, 512x512)
- ✅ Splash Screen
- ✅ Service Worker for caching

---

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Bottom Navigation** - Easy thumb access on mobile
- **Sidebar Menu** - Desktop navigation
- **Loading States** - Skeleton loaders
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Action feedback
- **Dark/Light Theme** - User preference

---

## 📈 Future Enhancements (TODO)

1. [ ] Push Notifications
2. [ ] Social Login (Google, Facebook)
3. [ ] Discussion Forum
4. [ ] Video Tutorials
5. [ ] Mock Tests with Ranking
6. [ ] Study Planner
7. [ ] Bookmark Questions
8. [ ] Share Progress on Social Media
9. [ ] Admin Dashboard for Content Management
10. [ ] Analytics Dashboard

---

## 👨‍💻 Developer Notes

### Key Files to Know
- `src/App.jsx` - Route definitions
- `src/context/AuthContext.jsx` - Auth state management
- `src/services/pdfService.js` - All PDF data (static, no MongoDB)
- `src/services/offlineStorage.js` - IndexedDB operations
- `backend/src/main/java/com/tnexam/config/SecurityConfig.java` - Security settings
- `src/pages/Contest.jsx` - Contest UI, leaderboard, and quiz submission flows
- `src/pages/Dashboard.jsx` - Contest modal, attempt awareness, and leaderboard hooks
- `update-contest.js` - Node script to seed daily/weekly contests in MongoDB for testing/deployment
- `backend/src/main/java/com/tnexam/controller/ContestController.java` - New REST surface for contest metadata, participation checks, and stats
- `backend/src/main/java/com/tnexam/service/ContestService.java` - Scheduler, leaderboard/rank management, and sample question selection

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8080/api

# Backend (application.properties)
spring.data.mongodb.uri=mongodb+srv://tngov_exam_prep:tngov_exam_prep@new-cluster.ww4x2jm.mongodb.net/tnexam?appName=New-Cluster
jwt.secret=your-secret-key
jwt.expiration=86400000
```

---

## 📄 License

This project is for educational purposes - TNPSC Exam Preparation.

---

**Built with ❤️ for TNPSC Aspirants**

*Last Updated: February 10, 2026*
