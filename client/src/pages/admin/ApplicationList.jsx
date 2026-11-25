import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import { sampleApplications } from '../../data/sampleData';

const statusOptions = ['All', 'Submitted', 'Under Admin Review', 'Eligibility Approved', 'Document Verification Pending', 'Admission Offered', 'Admission Confirmed', 'Not Eligible', 'Rejected'];
const courseOptions = ['All', 'B.Tech', 'M.Tech', 'MBA', 'MCA', 'BCA'];

export default function ApplicationList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('All');
  const [course, setCourse] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = sampleApplications.filter(a => {
    const matchStatus = status === 'All' || a.status === status;
    const matchCourse = course === 'All' || a.course === course;
    const matchSearch = !search || [a.applicationNumber, a.studentName, a.email].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchCourse && matchSearch;
  });

  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber', width: 160, render: (row) => <span className="font-mono text-xs text-blue-700 font-semibold">{row.applicationNumber}</span> },
    { header: 'Student', accessor: 'studentName', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-slate-800">{row.studentName}</p>
        <p className="text-xs text-slate-500">{row.email}</p>
      </div>
    )},
    { header: 'Course', key: 'course', render: (row) => (
      <div>
        <p className="font-medium text-slate-700">{row.course}</p>
        <p className="text-xs text-slate-500">{row.branch}</p>
      </div>
    )},
    { header: 'Merit Score', accessor: 'meritScore', sortable: true, render: (row) => row.meritScore ? `${row.meritScore}` : '—' },
    { header: 'Submitted', accessor: 'submittedAt', sortable: true, render: (row) => formatDate(row.submittedAt) },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: '', key: 'action', width: 100, render: (row) => (
      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/admin/applications/${row._id}`); }}>
        Review
      </Button>
    )},
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or app. number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={course} onChange={e => setCourse(e.target.value)} className="w-36">
            {courseOptions.map(c => <option key={c}>{c}</option>)}
          </Select>
          <Select value={status} onChange={e => setStatus(e.target.value)} className="w-52">
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />}>Export CSV</Button>
        </div>

        {/* Count badge */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{filtered.length}</span>
          <span>applications found</span>
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={12}
            onRowClick={(row) => navigate(`/admin/applications/${row._id}`)}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

