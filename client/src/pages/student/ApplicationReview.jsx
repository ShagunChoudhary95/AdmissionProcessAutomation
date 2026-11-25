import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const applicationPreview = {
  applicationNumber: 'ADM2026-7K9P42',
  status: 'Draft',
  personal: {
    name: 'Priya Sharma', dob: '2005-03-15', gender: 'Female', phone: '9876543210',
    category: 'General', domicileState: 'Rajasthan', parentName: 'Ramesh Sharma', parentPhone: '9988776655',
    address: '12, Shanti Nagar, Near MG Road, Jaipur, Rajasthan - 302001',
  },
  academic: {
    qualifications: [
      { level: '10th', board: 'RBSE', school: 'Govt. Sr. Sec. School, Jaipur', year: '2021', marks: '91.00%' },
      { level: '12th', board: 'RBSE', school: 'Govt. Sr. Sec. School, Jaipur', year: '2023', marks: '85.50%', subjects: 'PCM' },
    ],
    hasEntranceExam: false,
  },
  course: { name: 'B.Tech', branch: 'Computer Science', fees: { total: 150000 } },
  eligibility: { isEligible: true, meritScore: 87.5, meritRank: 12 },
};

export default function ApplicationReview() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const app = applicationPreview;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // await applicationService.submit(applicationId);
      await new Promise(r => setTimeout(r, 1200));
      toast.success('Application submitted successfully!');
      navigate('/student/documents');
    } catch {
      toast.error('Submission failed. Please try again.');
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

