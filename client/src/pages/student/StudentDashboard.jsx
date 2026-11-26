import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, CreditCard, CheckCircle, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge, DocStatusBadge } from '../../components/ui/Badge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { applicationService, documentService, notificationService } from '../../services';

const quickActions = [
  { label: 'Upload Documents', href: '/student/documents', icon: Upload, color: 'bg-blue-50 text-blue-700' },
  { label: 'Personal & Academic', href: '/student/profile', icon: FileText, color: 'bg-teal-50 text-teal-700' },
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

        const appId = myApp?._id || myApp?.id;
        if (appId) {
          const docRes = await documentService.list(appId);
          const docs = docRes.data.documents || [];
          const reqDocs = docs.filter((d) => d.requiredForCourse);
          const verified = reqDocs.filter((d) => d.currentVersion?.verificationStatus === 'Verified' || d.currentVersion?.verificationStatus === 'VERIFIED').length;
          const uploaded = docs.filter((d) => d.currentVersion?.filePath).length;
          const reuploadDocs = docs.filter((d) => d.currentVersion?.verificationStatus === 'Re-upload Required' || d.currentVersion?.verificationStatus === 'RE_UPLOAD_REQUIRED' || d.currentVersion?.verificationStatus === 'REUPLOAD_REQUESTED');
          setDocCounts({ uploaded, required: reqDocs.length || docs.length, verified, reuploadDocs });
        }
      } catch {
        setNotifications([]);
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
          <p className="text-sm text-slate-500 mt-1">Track your admission progress, upload verification documents, and check status below.</p>
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

        {/* Action Required: Document Re-upload alerts */}
        {docCounts.reuploadDocs.map((doc) => (
          <div key={doc._id} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Action Required: {doc.documentType}</p>
              <p className="text-sm text-amber-700 mt-0.5">{doc.currentVersion?.remarks}</p>
            </div>
            <Link to="/student/documents">
              <Button size="sm" variant="warning">Re-upload Now</Button>
            </Link>
          </div>
        ))}

        {/* 1. DOCUMENT VERIFICATION PART - PLACED FIRST */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle>Document Upload & Verification</CardTitle>
                <p className="text-xs text-slate-500">Required certificates, marksheets, and identity proof</p>
              </div>
            </div>
            <Link to="/student/documents">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Upload Documents
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="py-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500">Required</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{docCounts.required || 4}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Uploaded</p>
                <p className="text-lg font-bold text-blue-800 mt-0.5">{docCounts.uploaded}</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                <p className="text-xs text-teal-600 font-medium">Verified by Officer</p>
                <p className="text-lg font-bold text-teal-800 mt-0.5">{docCounts.verified}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Pending Review</p>
                <p className="text-lg font-bold text-amber-800 mt-0.5">
                  {Math.max(0, (docCounts.uploaded || 0) - (docCounts.verified || 0))}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">Verification Progress</span>
                <span className="text-slate-500 font-semibold">
                  {docCounts.required > 0 ? Math.round((docCounts.verified / docCounts.required) * 100) : 0}% Complete
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${docCounts.required > 0 ? (docCounts.verified / docCounts.required) * 100 : 0}%` }}
                />
              </div>
            </div>
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

        {/* 2. APPLICATION SUBMISSION & DETAILS PART */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <CardTitle>Application Submission Summary</CardTitle>
                <p className="text-xs text-slate-500">Program allocation and enrollment details</p>
              </div>
              {app && <StatusBadge status={app.status || 'Submitted'} />}
            </CardHeader>
            <CardBody className="space-y-4 pt-4">
              {loading ? (
                <div className="h-28 bg-slate-100 rounded animate-pulse" />
              ) : !app ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-sm text-slate-500">You haven't submitted an application yet.</p>
                  <Link to="/student/profile"><Button size="sm">Start Application Now</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Target Course</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{app.courseId?.name || app.course?.name || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Allotted Branch</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{app.branchId?.name || app.branch?.name || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Merit Score</p>
                    <p className="font-semibold text-blue-700 mt-0.5">{app.meritScore != null ? `${app.meritScore} / 100` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Admission Fee</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {formatCurrency(app.branch?.admissionFee || app.branchId?.fees?.total || 135000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Submission Date</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{formatDate(app.submittedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Application Number</p>
                    <p className="font-mono font-semibold text-blue-700 mt-0.5">{app.applicationNumber}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent updates */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle>Recent Updates</CardTitle>
              {unread.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread.length}</span>
              )}
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No notifications yet</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div key={n._id || n.id} className={`px-5 py-3 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
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
      </div>
    </DashboardLayout>
  );
}
