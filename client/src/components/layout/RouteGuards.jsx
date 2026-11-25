import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PageLoader } from '../ui/States';

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // redirect to their dashboard
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
  }

  return <Outlet />;
}

