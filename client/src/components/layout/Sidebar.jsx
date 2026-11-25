import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, GraduationCap, FileText, Upload,
  CreditCard, CheckCircle, Settings, LogOut, Users,
  BookOpen, Shield, ClipboardList, BarChart3, ListChecks,
  History, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

const studentNav = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Personal Details', href: '/student/profile', icon: User },
  { label: 'Academic Details', href: '/student/academic', icon: GraduationCap },
  { label: 'Course Selection', href: '/student/courses', icon: BookOpen },
  { label: 'Application', href: '/student/application', icon: FileText },
  { label: 'Documents', href: '/student/documents', icon: Upload },
  { label: 'Status & Timeline', href: '/student/status', icon: CheckCircle },
  { label: 'Payment', href: '/student/payment', icon: CreditCard },
];

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: ClipboardList },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Branches', href: '/admin/branches', icon: Settings },
  { label: 'Eligibility Rules', href: '/admin/eligibility-rules', icon: Shield },
  { label: 'Merit Rules', href: '/admin/merit-rules', icon: ListChecks },
  { label: 'Seat Management', href: '/admin/seats', icon: Users },
  { label: 'Merit List', href: '/admin/merit-list', icon: GraduationCap },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

const officerNav = [
  { label: 'Dashboard', href: '/officer/dashboard', icon: LayoutDashboard },
  { label: 'Verification Queue', href: '/officer/queue', icon: ClipboardList },
  { label: 'History', href: '/officer/history', icon: History },
];

const navByRole = { student: studentNav, admin: adminNav, officer: officerNav };

export function Sidebar({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const nav = navByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-blue-900 text-white transition-all duration-200 flex-shrink-0 relative',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-blue-800', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-blue-800" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">AdmissionPortal</p>
            <p className="text-xs text-blue-300 capitalize">{role}</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-md text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-blue-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center text-slate-500 hover:text-slate-700"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}

