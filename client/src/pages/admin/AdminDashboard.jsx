import { Users, FileText, CheckCircle, XCircle, Clock, GraduationCap, Upload } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SummaryCard } from '../../components/ui/Card';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import { sampleApplications, sampleAdminStats, sampleSeatData } from '../../data/sampleData';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'B.Tech', applications: 98, admitted: 24 },
  { name: 'M.Tech', applications: 45, admitted: 10 },
  { name: 'MBA', applications: 62, admitted: 15 },
  { name: 'MCA', applications: 28, admitted: 5 },
  { name: 'BCA', applications: 15, admitted: 2 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const s = sampleAdminStats;

  const recentColumns = [
    { header: 'App. No.', accessor: 'applicationNumber', width: 160, render: (row) => <span className="font-mono text-xs">{row.applicationNumber}</span> },
    { header: 'Student', accessor: 'studentName', sortable: true },
    { header: 'Course / Branch', key: 'course', render: (row) => `${row.course} · ${row.branch}` },
    { header: 'Submitted', accessor: 'submittedAt', sortable: true, render: (row) => formatDate(row.submittedAt) },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: '', key: 'action', render: (row) => <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/applications/${row._id}`)}>Review →</Button> },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Total Applications" value={s.totalApplications} icon={<FileText className="w-5 h-5" />} color="blue" />
          <SummaryCard title="Pending Review" value={s.pendingReview} icon={<Clock className="w-5 h-5" />} color="amber" />
          <SummaryCard title="Eligible" value={s.eligibleApplications} icon={<CheckCircle className="w-5 h-5" />} color="teal" />
          <SummaryCard title="Confirmed" value={s.admissionsConfirmed} icon={<GraduationCap className="w-5 h-5" />} color="green" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard title="Not Eligible" value={s.ineligibleApplications} icon={<XCircle className="w-5 h-5" />} color="red" />
          <SummaryCard title="Doc Verification" value={s.pendingDocVerification} icon={<Upload className="w-5 h-5" />} color="purple" />
          <SummaryCard title="Docs Verified" value={s.documentsVerified} icon={<CheckCircle className="w-5 h-5" />} color="indigo" />
          <SummaryCard title="Total Students" value={s.totalApplications} icon={<Users className="w-5 h-5" />} color="blue" subtitle="registered" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Applications chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Applications by Course</CardTitle></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={18} barCategoryGap={28}>
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
                {sampleSeatData.slice(0, 5).map((s, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 truncate max-w-32">{s.branch}</span>
                      <span className="text-slate-500">{s.available} left</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.available > 20 ? 'bg-teal-500' : s.available > 5 ? 'bg-amber-400' : 'bg-red-500'}`}
                        style={{ width: `${(s.available / s.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
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
            data={sampleApplications}
            pageSize={5}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

