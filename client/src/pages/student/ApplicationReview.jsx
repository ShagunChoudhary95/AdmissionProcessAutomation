import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { applicationService, studentService } from '../../services';
import toast from 'react-hot-toast';

const defaultPreview = {
  applicationNumber: 'ADM2026-PENDING',
  status: 'Draft',
  personal: {
    name: '', dob: '', gender: '', phone: '',
    category: '', domicileState: '', parentName: '', parentPhone: '',
    address: '',
  },
  academic: {
    qualifications: [],
    hasEntranceExam: false,
  },
  course: { name: '', branch: '', fees: { total: 125000 } },
  eligibility: { isEligible: true, meritScore: 0, meritRank: 0 },
};

export default function ApplicationReview() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState(defaultPreview);
  const [appId, setAppId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [myAppRes, profileRes] = await Promise.all([
          applicationService.getMy(),
          studentService.getProfile(),
        ]);
        const liveApp = myAppRes.data.application || (myAppRes.data.applications && myAppRes.data.applications[0]);
        const prof = profileRes.data.profile;

        if (liveApp) {
          setAppId(liveApp._id);
          const p = prof?.personal || {};
          const a = prof?.academic || {};
          const courseName = liveApp.course?.name || liveApp.courseId?.name || 'Not Selected';
          const branchName = liveApp.branch?.name || liveApp.branchId?.name || 'Not Selected';
          const feeTotal = liveApp.branch?.fees?.total || liveApp.branch?.totalFee || 125000;

          setApp({
            applicationNumber: liveApp.applicationNumber || 'ADM2026-DRAFT',
            status: liveApp.status || 'Draft',
            personal: {
              name: p.name || liveApp.studentName || 'Student',
              dob: p.dob || '',
              gender: p.gender || '',
              phone: p.phone || '',
              category: p.category || 'General',
              domicileState: p.domicileState || 'Uttar Pradesh',
              parentName: p.parentName || '',
              parentPhone: p.parentPhone || '',
              address: p.address || (p.addressLine1 ? `${p.addressLine1}, ${p.city || ''}` : ''),
            },
            academic: {
              qualifications: (a.qualifications || []).map(q => ({
                level: q.level,
                board: q.board,
                school: q.schoolCollege || q.school,
                year: q.yearOfPassing,
                marks: q.marks ? `${q.marks}%` : '—',
                subjects: q.subjects,
              })),
              hasEntranceExam: !!a.hasEntranceExam,
            },
            course: {
              name: courseName,
              branch: branchName,
              fees: { total: feeTotal },
            },
            eligibility: {
              isEligible: true,
              meritScore: liveApp.meritScore || 85.0,
              meritRank: liveApp.meritRank || 1,
            },
          });
        }
      } catch (err) {
        console.error("Failed to load application review data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!appId) {
      toast.error('No active draft application found.');
      return;
    }
    setSubmitting(true);
    try {
      await applicationService.submit(appId);
      toast.success('Application submitted successfully!');
      navigate('/student/documents');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const Section = ({ title, children }) => (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );

  const Row = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  );

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Review Your Application</h2>
            <p className="text-sm text-slate-500">Please review all information carefully before submitting. You cannot edit it after submission.</p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {/* App number */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-blue-800">Application Number: <span className="font-bold">{app.applicationNumber}</span></span>
        </div>

        <Section title="Personal Information">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Row label="Full Name" value={app.personal.name} />
            <Row label="Date of Birth" value={formatDate(app.personal.dob)} />
            <Row label="Gender" value={app.personal.gender} />
            <Row label="Mobile" value={app.personal.phone} />
            <Row label="Category" value={app.personal.category} />
            <Row label="Domicile State" value={app.personal.domicileState} />
            <Row label="Parent/Guardian" value={app.personal.parentName} />
            <Row label="Parent Mobile" value={app.personal.parentPhone} />
            <Row label="Address" value={app.personal.address} />
          </div>
        </Section>

        <Section title="Academic Details">
          <div className="space-y-3">
            {app.academic.qualifications.map((q, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Row label="Level" value={q.level} />
                <Row label="Board" value={q.board} />
                <Row label="Year" value={q.year} />
                <Row label="School / College" value={q.school} />
                <Row label="Marks" value={q.marks} />
                {q.subjects && <Row label="Subjects" value={q.subjects} />}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Course Selection">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Row label="Course" value={app.course.name} />
            <Row label="Branch" value={app.course.branch} />
            <Row label="Total Fees" value={formatCurrency(app.course.fees.total)} />
            <Row label="Eligibility" value="Eligible ✓" />
            <Row label="Merit Score" value={`${app.eligibility.meritScore} / 100`} />
            <Row label="Merit Rank" value={`#${app.eligibility.meritRank}`} />
          </div>
        </Section>

        {/* Declaration */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            By submitting this application, I declare that all information provided is true and correct to the best of my knowledge. I understand that any false information will result in cancellation of admission.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/student/courses')}>← Edit Course</Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/student/profile')}>Edit Details</Button>
            <Button onClick={() => setConfirmOpen(true)}>Submit Application</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Submit Application"
        message="Are you sure you want to submit? Once submitted, you cannot edit your personal or academic details."
        confirmLabel="Yes, Submit"
        variant="primary"
        loading={submitting}
      />
    </DashboardLayout>
  );
}

