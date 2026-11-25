import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, GraduationCap, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReasonModal, ConfirmDialog } from '../../components/ui/Modal';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/helpers';
import { sampleApplications } from '../../data/sampleData';
import toast from 'react-hot-toast';

const fullApplication = {
  ...sampleApplications[0],
  personal: {
    dob: '2005-03-15', gender: 'Female', phone: '9876543210', category: 'General',
    domicileState: 'Rajasthan', parentName: 'Ramesh Sharma', parentPhone: '9988776655',
    address: '12, Shanti Nagar, Jaipur, Rajasthan - 302001',
  },
  academic: {
    qualifications: [
      { level: '10th', board: 'RBSE', school: 'Govt. Sr. Sec. School', year: '2021', marks: '91.00%' },
      { level: '12th', board: 'RBSE', school: 'Govt. Sr. Sec. School', year: '2023', marks: '85.50%', subjects: 'PCM' },
    ],
  },
  eligibility: {
    criteria: [
      { label: '12th Percentage', required: '≥ 60%', achieved: '85.5%', passed: true },
      { label: 'Physics & Mathematics', required: 'Must have studied', achieved: 'Yes', passed: true },
    ],
    meritComponents: [
      { label: '12th Marks (80%)', score: 68.4 },
      { label: 'Academic Record (20%)', score: 19.1 },
    ],
  },
  fees: { total: 150000 },
  statusHistory: [
    { status: 'Draft', timestamp: '2026-11-19T08:00:00Z', actor: 'Student', note: 'Created' },
    { status: 'Submitted', timestamp: '2026-11-20T10:30:00Z', actor: 'Student', note: 'Submitted' },
    { status: 'Under Admin Review', timestamp: '2026-11-20T11:00:00Z', actor: 'System', note: 'Auto-routed to review' },
  ],
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const app = fullApplication;

  const handleAction = async (action, reason) => {
    setLoading(true);
    try {
      // await adminService.reviewApplication(id, { action, reason });
      await new Promise(r => setTimeout(r, 1000));
      toast.success(`Application ${action}d successfully.`);
      setRejectOpen(false); setCorrectionOpen(false); setApproveOpen(false); setOfferOpen(false);
    } catch {
      toast.error('Action failed. Please try again.');
    } finally { setLoading(false); }
  };

  const Row = ({ label, value }) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/applications')}>Back</Button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">{app.studentName}</h2>
            <p className="text-xs text-slate-500 font-mono">{app.applicationNumber}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-sm font-medium text-slate-700 mr-2 self-center">Actions:</span>
          <Button size="sm" variant="success" leftIcon={<CheckCircle className="w-4 h-4" />} onClick={() => setApproveOpen(true)}>Approve</Button>
          <Button size="sm" variant="warning" leftIcon={<MessageSquare className="w-4 h-4" />} onClick={() => setCorrectionOpen(true)}>Request Correction</Button>
          <Button size="sm" leftIcon={<GraduationCap className="w-4 h-4" />} onClick={() => setOfferOpen(true)}>Issue Offer</Button>
          <Button size="sm" variant="danger" leftIcon={<XCircle className="w-4 h-4" />} onClick={() => setRejectOpen(true)}>Reject</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Personal */}
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Row label="Name" value={app.studentName} />
                  <Row label="Date of Birth" value={formatDate(app.personal.dob)} />
                  <Row label="Gender" value={app.personal.gender} />
                  <Row label="Mobile" value={app.personal.phone} />
                  <Row label="Category" value={app.personal.category} />
                  <Row label="Domicile" value={app.personal.domicileState} />
                  <Row label="Parent / Guardian" value={app.personal.parentName} />
                  <Row label="Parent Mobile" value={app.personal.parentPhone} />
                </div>
              </CardBody>
            </Card>

            {/* Academic */}
            <Card>
              <CardHeader><CardTitle>Academic Qualifications</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                {app.academic.qualifications.map((q, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg grid grid-cols-3 gap-3">
                    <Row label="Level" value={q.level} />
                    <Row label="Board" value={q.board} />
                    <Row label="Year" value={q.year} />
                    <Row label="Institution" value={q.school} />
                    <Row label="Marks" value={q.marks} />
                    {q.subjects && <Row label="Subjects" value={q.subjects} />}
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader><CardTitle>Eligibility & Merit</CardTitle></CardHeader>
              <CardBody>
                <div className="mb-4">
                  <table className="w-full text-sm mb-4">
                    <thead><tr className="border-b border-slate-200"><th className="text-left pb-2 text-xs text-slate-500">Criteria</th><th className="text-left pb-2 text-xs text-slate-500">Required</th><th className="text-left pb-2 text-xs text-slate-500">Achieved</th><th className="text-left pb-2 text-xs text-slate-500">Result</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {app.eligibility.criteria.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2 text-slate-700">{c.label}</td>
                          <td className="py-2 text-slate-600">{c.required}</td>
                          <td className="py-2 text-slate-600">{c.achieved}</td>
                          <td className="py-2">{c.passed ? <span className="text-xs text-teal-700 font-medium">✓ Pass</span> : <span className="text-xs text-red-600 font-medium">✗ Fail</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-slate-500">Merit Score</p>
                        <p className="text-lg font-bold text-blue-700">{app.meritScore}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Merit Rank</p>
                        <p className="text-lg font-bold text-blue-700">#{app.meritRank}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.eligibilityStatus === 'eligible' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                      {app.eligibilityStatus === 'eligible' ? '✓ Eligible' : '✗ Not Eligible'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                <Row label="Course" value={app.course} />
                <Row label="Branch" value={app.branch} />
                <Row label="Total Fee" value={formatCurrency(app.fees.total)} />
                <Row label="Submitted" value={formatDateTime(app.submittedAt)} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {[...app.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="px-4 py-3">
                      <StatusBadge status={h.status} />
                      <p className="text-xs text-slate-500 mt-1">{formatDateTime(h.timestamp)} · {h.actor}</p>
                      {h.note && <p className="text-xs text-slate-600 mt-0.5">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <ReasonModal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Application" placeholder="Enter rejection reason (required)..." loading={loading} onSubmit={(r) => handleAction('reject', r)} />
      <ReasonModal open={correctionOpen} onClose={() => setCorrectionOpen(false)} title="Request Correction" placeholder="Describe what needs to be corrected..." loading={loading} onSubmit={(r) => handleAction('correction', r)} />
      <ConfirmDialog open={approveOpen} onClose={() => setApproveOpen(false)} onConfirm={() => handleAction('approve')} title="Approve Application" message="Approve this application and move it to document verification?" confirmLabel="Approve" variant="primary" loading={loading} />
      <ReasonModal open={offerOpen} onClose={() => setOfferOpen(false)} title="Issue Admission Offer" placeholder="Enter any conditions or remarks for this offer..." loading={loading} onSubmit={(r) => handleAction('offer', r)} />
    </DashboardLayout>
  );
}

