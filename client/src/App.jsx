import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, PublicRoute } from './components/layout/RouteGuards';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import PersonalDetails from './pages/student/PersonalDetails';
import AcademicDetails from './pages/student/AcademicDetails';
import CourseSelection from './pages/student/CourseSelection';
import EligibilityResult from './pages/student/EligibilityResult';
import ApplicationReview from './pages/student/ApplicationReview';
import DocumentUpload from './pages/student/DocumentUpload';
import ApplicationStatus from './pages/student/ApplicationStatus';
import Payment from './pages/student/Payment';
import Receipt from './pages/student/Receipt';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationList from './pages/admin/ApplicationList';
import ApplicationDetail from './pages/admin/ApplicationDetail';
import CourseManagement from './pages/admin/CourseManagement';
import BranchManagement from './pages/admin/BranchManagement';
import EligibilityRules from './pages/admin/EligibilityRules';
import MeritRules from './pages/admin/MeritRules';
import SeatManagement from './pages/admin/SeatManagement';
import MeritList from './pages/admin/MeritList';
import Reports from './pages/admin/Reports';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import VerificationQueue from './pages/officer/VerificationQueue';
import DocumentVerification from './pages/officer/DocumentVerification';
import VerificationHistory from './pages/officer/VerificationHistory';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#f8fafc', fontSize: '13px', borderRadius: '8px', padding: '10px 14px' },
          success: { style: { background: '#065f46', color: '#d1fae5' } },
          error: { style: { background: '#7f1d1d', color: '#fee2e2' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<PersonalDetails />} />
          <Route path="/student/academic" element={<AcademicDetails />} />
          <Route path="/student/courses" element={<CourseSelection />} />
          <Route path="/student/eligibility" element={<EligibilityResult />} />
          <Route path="/student/application" element={<ApplicationReview />} />
          <Route path="/student/documents" element={<DocumentUpload />} />
          <Route path="/student/status" element={<ApplicationStatus />} />
          <Route path="/student/payment" element={<Payment />} />
          <Route path="/student/receipt" element={<Receipt />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<ApplicationList />} />
          <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/branches" element={<BranchManagement />} />
          <Route path="/admin/eligibility-rules" element={<EligibilityRules />} />
          <Route path="/admin/merit-rules" element={<MeritRules />} />
          <Route path="/admin/seats" element={<SeatManagement />} />
          <Route path="/admin/merit-list" element={<MeritList />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* Officer routes */}
        <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/queue" element={<VerificationQueue />} />
          <Route path="/officer/verify/:applicationId" element={<DocumentVerification />} />
          <Route path="/officer/history" element={<VerificationHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
