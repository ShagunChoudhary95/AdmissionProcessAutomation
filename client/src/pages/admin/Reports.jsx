import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { adminService } from '../../services';

export default function Reports() {
  const [courseStats, setCourseStats] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await adminService.getReports('summary');
        if (res.data) {
          if (res.data.courseStats) {
            setCourseStats(res.data.courseStats);
          }
          if (res.data.statusList) {
            setStatusBreakdown(res.data.statusList);
          }
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

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
              {courseStats.length > 0 ? (
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
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  {loading ? 'Loading report data...' : 'No applications available for course analysis.'}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Application Status Distribution</CardTitle></CardHeader>
            <CardBody>
              {statusBreakdown.some(s => s.value > 0) ? (
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
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  {loading ? 'Loading report data...' : 'No active applications in status distribution.'}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
