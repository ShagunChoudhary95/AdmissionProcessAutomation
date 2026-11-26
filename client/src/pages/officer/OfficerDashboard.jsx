import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, RefreshCw, XCircle, FileCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SummaryCard, Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { DocStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { officerService } from '../../services';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingVerification: 0,
    verifiedToday: 0,
    rejectedOrReupload: 0,
    verifiedApplications: 0,
  });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, queueRes] = await Promise.all([
          officerService.getDashboard(),
          officerService.getQueue({ page: 1, limit: 5 }),
        ]);
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (queueRes.data?.applications) {
          setQueue(queueRes.data.applications.map(a => ({
            ...a,
            studentName: a.studentName || a.student?.name || 'Student',
            course: a.course?.name || a.courseId?.name || 'B.Tech',
            branch: a.branch?.name || a.branchId?.name || 'CSE',
            docQueueStatus: (a.status === 'VERIFIED' || a.status === 'Verified') ? 'Verified' : ((a.status === 'CORRECTION_REQUIRED' || a.status === 'Correction Required') ? 'Re-upload Required' : 'Pending Verification'),
          })));
        }
      } catch (err) {
        console.error('Failed to load officer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
        <Button size="sm" variant="primary" onClick={() => navigate(`/officer/verify/${r.id || r._id}`)}>
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
          <SummaryCard title="Pending Queue" value={stats.pendingVerification || 0} icon={<Clock className="w-5 h-5" />} color="amber" />
          <SummaryCard title="Verified Today" value={stats.verifiedToday || 0} icon={<CheckCircle className="w-5 h-5" />} color="teal" />
          <SummaryCard title="Verified Total" value={stats.verifiedApplications || 0} icon={<CheckCircle className="w-5 h-5" />} color="blue" />
          <SummaryCard title="Rejected / Re-upload" value={stats.rejectedOrReupload || 0} icon={<XCircle className="w-5 h-5" />} color="red" />
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-700" />
              Recent Verification Queue
            </CardTitle>
            <Button size="sm" variant="secondary" onClick={() => navigate('/officer/queue')}>View Full Queue</Button>
          </CardHeader>
          <DataTable columns={columns} data={queue} pageSize={5} emptyMessage="No applications waiting in verification queue." />
        </Card>
      </div>
    </DashboardLayout>
  );
}

