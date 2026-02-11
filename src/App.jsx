import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Quiz from './pages/Quiz'
import PracticeTest from './pages/PracticeTest'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import Books from './pages/Books'
import OfflineBooks from './pages/OfflineBooks'
import MyProgress from './pages/MyProgress'
import PDFViewer from './pages/PDFViewer'
import AdminNotifications from './pages/AdminNotifications'
import './App.css'

function App() {
  console.log('App component rendering...');
  
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/offline-books" element={<ProtectedRoute><OfflineBooks /></ProtectedRoute>} />
              <Route path="/pdf-viewer" element={<ProtectedRoute><PDFViewer /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/my-progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
              <Route path="/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/practice-test" element={<ProtectedRoute><PracticeTest /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
              {/* Catch-all route - redirect unknown paths to login */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App