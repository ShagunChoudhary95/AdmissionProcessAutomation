import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Clock, GraduationCap, Upload } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SummaryCard } from '../../components/ui/Card';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { adminService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultChartData = [
  { name: 'B.Tech', applications: 12, admitted: 4 },
  { name: 'MBA', applications: 8, admitted: 3 },
  { name: 'MCA', applications: 6, admitted: 2 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    submitted: 0,
    underVerification: 0,
    verified: 0,
    offersIssued: 0,
    confirmed: 0,
    rejected: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await adminService.getDashboard();
        if (res.data) {
          setStats(res.data);
          if (res.data.recentApplications) {
            setRecentApps(res.data.recentApplications.map(a => ({
              ...a,
              studentName: a.studentName || a.student?.name || 'Student',
              course: a.course?.name || a.courseId?.name || 'B.Tech',
              branch: a.branch?.name || a.branchId?.name || 'CSE',
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const recentColumns = [
    { header: 'App. No.', accessor: 'applicationNumber', width: 160, render: (row) => <span className="font-mono text-xs">{row.applicationNumber}</span> },
    { header: 'Student', accessor: 'studentName', sortable: true },
    { header: 'Course / Branch', key: 'course', render: (row) => `${row.course} · ${row.branch}` },
    { header: 'Submitted', accessor: 'submittedAt', sortable: true, render: (row) => formatDate(row.submittedAt) },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: '', key: 'action', render: (row) => <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/applications/${row.id || row._id}`)}>Review →</Button> },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Total Applications" value={stats.totalApplications || 0} icon={<FileText className="w-5 h-5" />} color="blue" />
          <SummaryCard title="Pending Review" value={stats.submitted || 0} icon={<Clock className="w-5 h-5" />} color="amber" />
          <SummaryCard title="Verified Docs" value={stats.verified || 0} icon={<CheckCircle className="w-5 h-5" />} color="teal" />
          <SummaryCard title="Confirmed" value={stats.confirmed || 0} icon={<GraduationCap className="w-5 h-5" />} color="green" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Rejected" value={stats.rejected || 0} icon={<XCircle className="w-5 h-5" />} color="red" />
          <SummaryCard title="In Verification" value={stats.underVerification || 0} icon={<Upload className="w-5 h-5" />} color="purple" />
          <SummaryCard title="Offers Issued" value={stats.offersIssued || 0} icon={<CheckCircle className="w-5 h-5" />} color="indigo" />
          <SummaryCard title="Total Seats" value={stats.totalSeats || 600} icon={<Users className="w-5 h-5" />} color="blue" subtitle={`${stats.availableSeats || 0} seats left`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Applications chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Applications by Course</CardTitle></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={defaultChartData} barSize={18} barCategoryGap={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
                  <Bar dataKey="admitted" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Admitted" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Seat availability */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Seat Availability</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => navigate('/admin/seats')}>View All</Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {(stats.seatData || []).slice(0, 5).map((s, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 truncate max-w-32">{s.branch}</span>
                      <span className="text-slate-500">{s.available} left</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.available > 20 ? 'bg-teal-500' : s.available > 5 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${s.total > 0 ? (s.available / s.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!stats.seatData || stats.seatData.length === 0) && (
                  <p className="p-4 text-xs text-slate-400 text-center">No branch seats available</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent applications */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/applications')}>View All</Button>
          </CardHeader>
          <DataTable
            columns={recentColumns}
            data={recentApps}
            pageSize={5}
            emptyMessage="No applications received yet."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

