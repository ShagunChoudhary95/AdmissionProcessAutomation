import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { DocStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import { sampleApplications } from '../../data/sampleData';

const queueItems = sampleApplications.map((a, i) => ({
  ...a,
  docQueueStatus: ['Pending Verification', 'Re-upload Required', 'Verified', 'Rejected', 'Pending Verification'][i % 5],
  totalDocs: 5,
  verifiedDocs: [2, 3, 5, 1, 0][i % 5],
}));

const filterStatuses = ['All', 'Pending Verification', 'Verified', 'Re-upload Required', 'Rejected'];

export default function VerificationQueue() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = queueItems.filter((item) => {
    const matchStatus = statusFilter === 'All' || item.docQueueStatus === statusFilter;
    const matchSearch = !search || [item.applicationNumber, item.studentName, item.course].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber', render: (r) => <span className="font-mono text-xs font-semibold text-blue-700">{r.applicationNumber}</span> },
    { header: 'Student Name', accessor: 'studentName', sortable: true },
    { header: 'Selected Course', key: 'course', render: (r) => `${r.course} — ${r.branch}` },
    { header: 'Submission Date', accessor: 'submittedAt', sortable: true, render: (r) => formatDate(r.submittedAt) },
    { header: 'Progress', key: 'progress', render: (r) => <span className="text-xs font-medium text-slate-600">{r.verifiedDocs} / {r.totalDocs} verified</span> },
    { header: 'Status', accessor: 'docQueueStatus', render: (r) => <DocStatusBadge status={r.docQueueStatus} /> },
    {
      header: 'Action',
      key: 'action',
      render: (r) => (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/officer/verify/${r._id}`); }}>
          Inspect Docs
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="officer">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Document Verification Queue</h2>
          <p className="text-sm text-slate-500">Select an application to inspect and verify each uploaded document.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by application number, student, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-52">
            {filterStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(r) => navigate(`/officer/verify/${r._id}`)}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

