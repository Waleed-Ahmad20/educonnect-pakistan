import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage, RegisterPage, ProfilePage, ForgotPasswordPage } from './pages/auth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import your layout components
import MainLayout from './components/common/MainLayout';
import StudentLayout from './pages/student/StudentLayout';
import TutorLayout from './pages/tutor/TutorLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Import student pages
import StudentDashboard from './pages/student/Dashboard';
import FindTutors from './pages/student/FindTutors';
import TutorDetail from './pages/student/TutorDetail';
import Sessions from './pages/student/Sessions';
import Wishlist from './pages/student/Wishlist';
import Reviews from './pages/student/Reviews';
import ReviewForm from './pages/student/ReviewForm';

// Import tutor pages
import TutorDashboard from './pages/tutor/Dashboard';
import TutorSessions from './pages/tutor/Sessions';
import TutorAvailability from './pages/tutor/Availability';
import TutorEarnings from './pages/tutor/Earnings';
// import TutorReviews from './pages/tutor/Reviews';

// Import admin pages
import AdminDashboard from './pages/admin/Dashboard';
import VerificationRequests from './pages/admin/VerificationRequests';
import VerificationDetail from './pages/admin/VerificationDetail';
import Reports from './pages/admin/Reports';

// Import other pages (placeholders for now)
const Dashboard = () => {
  const { hasRole } = useAuth();
  
  // Redirect users to their specific dashboard based on role
  if (hasRole('student')) {
    return <Navigate to="/student/dashboard" replace />;
  } else if (hasRole('tutor')) {
    return <Navigate to="/tutor/dashboard" replace />;
  } else if (hasRole('admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If no specific role, show a welcome message
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Welcome to EduConnect Pakistan</h1>
      <p className="text-gray-600 mb-8">Please select your dashboard from the navigation above.</p>
    </div>
  );
};

const NotFound = () => <div>404 - Page Not Found</div>;
const Unauthorized = () => <div>401 - Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Student specific routes */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Routes>
                      <Route element={<StudentLayout />}>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="find-tutors" element={<FindTutors />} />
                        <Route path="tutor/:tutorId" element={<TutorDetail />} />
                        <Route path="sessions" element={<Sessions />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="reviews" element={<Reviews />} />
                        <Route path="reviews/add/:sessionId" element={<ReviewForm />} />
                        <Route path="reviews/edit/:reviewId" element={<ReviewForm />} />
                      </Route>
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Tutor specific routes */}
              <Route
                path="/tutor/*"
                element={
                  <ProtectedRoute requiredRole="tutor">
                    <Routes>
                      <Route element={<TutorLayout />}>
                        <Route path="dashboard" element={<TutorDashboard />} />
                        <Route path="sessions" element={<TutorSessions />} />
                        <Route path="availability" element={<TutorAvailability />} />
                        <Route path="earnings" element={<TutorEarnings />} />
                        {/* <Route path="reviews" element={<TutorReviews />} /> */}
                      </Route>
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Admin specific routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Routes>
                      <Route element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="verification" element={<VerificationRequests />} />
                        <Route path="verification/:requestId" element={<VerificationDetail />} />
                        <Route path="reports" element={<Reports />} />
                      </Route>
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Special routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;