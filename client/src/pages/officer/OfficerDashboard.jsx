import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, RefreshCw, XCircle, FileCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SummaryCard, Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { DocStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { sampleApplications } from '../../data/sampleData';

const queuePreview = sampleApplications.slice(0, 4).map((a, i) => ({
  ...a,
  pendingDocs: i === 0 ? 3 : i === 1 ? 2 : 1,
  docQueueStatus: i === 0 ? 'Pending Verification' : i === 1 ? 'Re-upload Required' : 'Verified',
}));

export default function OfficerDashboard() {
  const navigate = useNavigate();

  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber', render: (r) => <span className="font-mono text-xs text-blue-700 font-semibold">{r.applicationNumber}</span> },
    { header: 'Student Name', accessor: 'studentName', sortable: true },
    { header: 'Course', key: 'course', render: (r) => `${r.course} — ${r.branch}` },
    { header: 'Submitted', accessor: 'submittedAt', render: (r) => formatDate(r.submittedAt) },
    { header: 'Status', accessor: 'docQueueStatus', render: (r) => <DocStatusBadge status={r.docQueueStatus} /> },
    {
      header: '',
      key: 'action',
      render: (r) => (
        <Button size="sm" variant="primary" onClick={() => navigate(`/officer/verify/${r._id}`)}>
          Verify Docs
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="officer">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Document Verification Overview</h2>
          <p className="text-sm text-slate-500">Review uploaded student documents, verify authenticity, or request re-uploads.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Pending Queue" value={42} icon={<Clock className="w-5 h-5" />} color="amber" />
          <SummaryCard title="Verified Today" value={18} icon={<CheckCircle className="w-5 h-5" />} color="teal" />
          <SummaryCard title="Re-upload Requested" value={9} icon={<RefreshCw className="w-5 h-5" />} color="purple" />
          <SummaryCard title="Rejected" value={4} icon={<XCircle className="w-5 h-5" />} color="red" />
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-700" />
              Recent Verification Queue
            </CardTitle>
            <Button size="sm" variant="secondary" onClick={() => navigate('/officer/queue')}>View Full Queue</Button>
          </CardHeader>
          <DataTable columns={columns} data={queuePreview} pageSize={5} />
        </Card>
      </div>
    </DashboardLayout>
  );
}

