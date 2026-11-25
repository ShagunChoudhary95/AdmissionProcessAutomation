import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { applicationService, documentService, notificationService } from '../../services';
import { sampleNotifications } from '../../data/sampleData';

const quickActions = [
  { label: 'Personal & Academic', href: '/student/profile', icon: FileText, color: 'bg-teal-50 text-teal-700' },
  { label: 'Upload Documents', href: '/student/documents', icon: Upload, color: 'bg-blue-50 text-blue-700' },
  { label: 'Pay Fees', href: '/student/payment', icon: CreditCard, color: 'bg-amber-50 text-amber-700' },
  { label: 'Check Status', href: '/student/status', icon: CheckCircle, color: 'bg-green-50 text-green-700' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { notifications, setNotifications } = useNotificationStore();
  const [app, setApp] = useState(null);
  const [docCounts, setDocCounts] = useState({ uploaded: 0, required: 0, verified: 0, reuploadDocs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appRes, notifRes] = await Promise.all([
          applicationService.getMy(),
          notificationService.list(),
        ]);
        if (!active) return;
        const myApp = appRes.data.application;
        setApp(myApp);
        setNotifications(notifRes.data.notifications || []);

        if (myApp?._id) {
          const docRes = await documentService.list(myApp._id);
          const docs = docRes.data.documents || [];
          const reqDocs = docs.filter((d) => d.requiredForCourse);
          const verified = reqDocs.filter((d) => d.currentVersion?.verificationStatus === 'Verified').length;
          const uploaded = docs.filter((d) => d.currentVersion?.filePath).length;
          const reuploadDocs = docs.filter((d) => d.currentVersion?.verificationStatus === 'Re-upload Required');
          setDocCounts({ uploaded, required: reqDocs.length || docs.length, verified, reuploadDocs });
        }
      } catch {
        setNotifications(sampleNotifications);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h2>
          <p className="text-sm text-slate-500 mt-1">Track your admission progress and complete pending steps below.</p>
        </div>

        {/* Progress tracker card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Admission Progress</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Application No: <span className="font-semibold text-slate-700 font-mono">{app?.applicationNumber || 'Not started'}</span>
              </p>
            </div>
            <StatusBadge status={app?.status || 'Draft'} />
          </CardHeader>
          <CardBody className="pt-6 pb-8">
            <ProgressTracker status={app?.status || 'Draft'} />
          </CardBody>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} to={href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex flex-col items-center gap-3 py-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Application Summary</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {loading ? (
                <div className="h-28 bg-slate-100 rounded animate-pulse" />
              ) : !app ? (
                <div className="py-4 text-center space-y-3">
                  <p className="text-sm text-slate-500">You haven't started an application yet.</p>
                  <Link to="/student/profile"><Button size="sm">Start Application</Button></Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Course</p>
                      <p className="font-semibold text-slate-800">{app.courseId?.name || 'Not selected'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Branch</p>
                      <p className="font-semibold text-slate-800">{app.branchId?.name || 'Not selected'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Merit Score</p>
                      <p className="font-semibold text-slate-800">{app.meritScore != null ? `${app.meritScore} / 100` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Fees</p>
                      <p className="font-semibold text-slate-800">{formatCurrency(app.branchId?.fees?.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submitted</p>
                      <p className="font-semibold text-slate-800">{formatDate(app.submittedAt)}</p>
                    </div>
                  </div>

                  {docCounts.required > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Documents</span>
                        <span className="text-xs text-slate-500">{docCounts.verified} verified / {docCounts.required} required</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${(docCounts.verified / docCounts.required) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{docCounts.uploaded} uploaded</span>
                        <Link to="/student/documents" className="text-blue-700 hover:underline font-medium">
                          Manage →
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Updates</CardTitle>
              {unread.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread.length}</span>
              )}
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div key={n._id} className={`px-5 py-3 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 flex-shrink-0" />}
                        <div className={!n.isRead ? '' : 'ml-3.5'}>
                          <p className="text-xs font-semibold text-slate-700">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {docCounts.reuploadDocs.map((doc) => (
          <div key={doc._id} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Action Required: {doc.documentType}</p>
              <p className="text-sm text-amber-700 mt-0.5">{doc.currentVersion?.remarks}</p>
            </div>
            <Link to="/student/documents">
              <Button size="sm" variant="warning">Re-upload</Button>
            </Link>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
