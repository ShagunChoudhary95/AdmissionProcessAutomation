import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';

const courseStats = [
  { name: 'B.Tech', applied: 98, eligible: 82, admitted: 24 },
  { name: 'M.Tech', applied: 45, eligible: 38, admitted: 10 },
  { name: 'MBA', applied: 62, eligible: 55, admitted: 15 },
  { name: 'MCA', applied: 28, eligible: 24, admitted: 5 },
  { name: 'BCA', applied: 15, eligible: 14, admitted: 2 },
];

const statusBreakdown = [
  { name: 'Admitted', value: 56, color: '#0d9488' },
  { name: 'Doc Verification', value: 42, color: '#7c3aed' },
  { name: 'Under Review', value: 32, color: '#d97706' },
  { name: 'Offered', value: 28, color: '#2563eb' },
  { name: 'Not Eligible / Rejected', value: 30, color: '#dc2626' },
];

export default function Reports() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Overview of applications, eligibility rates, and confirmed admissions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Course-wise Funnel</CardTitle></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={courseStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="applied" fill="#3b82f6" name="Applied" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eligible" fill="#0d9488" name="Eligible" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="admitted" fill="#1e3a8a" name="Confirmed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Application Status Distribution</CardTitle></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

