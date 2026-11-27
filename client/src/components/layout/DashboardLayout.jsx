import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const pageTitles = {
  '/student/dashboard': 'Dashboard',
  '/student/profile': 'Personal Details',
  '/student/academic': 'Academic Details',
  '/student/courses': 'Course Selection',
  '/student/eligibility': 'Eligibility Result',
  '/student/application': 'My Application',
  '/student/documents': 'Document Upload',
  '/student/status': 'Application Status',
  '/student/payment': 'Fee Payment',
  '/student/receipt': 'Payment Receipt',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/applications': 'Applications',
  '/admin/courses': 'Course Management',
  '/admin/branches': 'Branch Management',
  '/admin/eligibility-rules': 'Eligibility Rules',
  '/admin/merit-rules': 'Merit Rules',
  '/admin/seats': 'Seat Management',
  '/admin/merit-list': 'Merit List',
  '/admin/reports': 'Reports & Analytics',
  '/officer/dashboard': 'Officer Dashboard',
  '/officer/queue': 'Verification Queue',
  '/officer/history': 'Verification History',
};

export function DashboardLayout({ role, children }) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || (pathname.includes('/admin/applications/') ? 'Application Detail' : 'AdmissionPortal');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-6">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

