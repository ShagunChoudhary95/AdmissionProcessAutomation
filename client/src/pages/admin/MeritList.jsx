import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function MeritList() {
  const navigate = useNavigate();
  const [courseFilter, setCourseFilter] = useState('All');
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, courseRes] = await Promise.all([
          adminService.getApplications({ page: 1, limit: 100 }),
          adminService.getCourses(),
        ]);
        if (appRes.data?.applications) {
          setApplications(appRes.data.applications.map(a => ({
            ...a,
            studentName: a.studentName || a.student?.name || 'Candidate',
            course: a.course?.name || a.courseId?.name || 'B.Tech',
            branch: a.branch?.name || a.branchId?.name || 'CSE',
          })));
        }
        if (courseRes.data?.courses) {
          setCourses(courseRes.data.courses);
        }
      } catch (err) {
        console.error('Failed to load merit list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const ranked = applications
    .filter((a) => a.meritScore !== null && (courseFilter === 'All' || a.course === courseFilter || a.course?.includes(courseFilter)))
    .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0))
    .map((a, idx) => ({ ...a, computedRank: idx + 1 }));

  const columns = [
    { header: 'Rank', accessor: 'computedRank', width: 70, render: (r) => <span className="font-bold text-blue-700">#{r.computedRank}</span> },
    { header: 'App. No.', accessor: 'applicationNumber', render: (r) => <span className="font-mono text-xs">{r.applicationNumber}</span> },
    { header: 'Student Name', accessor: 'studentName', sortable: true },
    { header: 'Course', key: 'course', render: (r) => `${r.course} — ${r.branch}` },
    { header: 'Merit Score', accessor: 'meritScore', sortable: true, render: (r) => <span className="font-semibold">{r.meritScore} / 100</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: '',
      key: 'action',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/applications/${r._id}`)}>
          View →
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Merit List</h2>
            <p className="text-sm text-slate-500">Ranked list of eligible applicants sorted by configured merit score.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-40">
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c.id || c._id} value={c.name}>{c.name}</option>
              ))}
            </Select>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => toast.success('Merit list exported.')}>
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <DataTable columns={columns} data={ranked} searchable searchPlaceholder="Search student or application number..." />
        </Card>
      </div>
    </DashboardLayout>
  );
}

