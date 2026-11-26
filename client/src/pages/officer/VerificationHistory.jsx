import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { DocStatusBadge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/helpers';
import { officerService } from '../../services';

export default function VerificationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await officerService.getHistory({ page: 1, limit: 100 });
        if (res.data?.history) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error('Failed to load verification history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber', render: (r) => <span className="font-mono text-xs text-blue-700 font-semibold">{r.applicationNumber || '—'}</span> },
    { header: 'Student', accessor: 'studentName', sortable: true, render: (r) => r.studentName || '—' },
    { header: 'Document', accessor: 'documentType', sortable: true, render: (r) => r.documentType || 'Document' },
    { header: 'Decision', accessor: 'decision', render: (r) => <DocStatusBadge status={r.decision || r.action} /> },
    { header: 'Officer', accessor: 'officer', render: (r) => r.officer || 'Officer' },
    { header: 'Remarks', accessor: 'remarks', render: (r) => r.remarks || '—' },
    { header: 'Timestamp', accessor: 'timestamp', sortable: true, render: (r) => formatDateTime(r.timestamp) },
  ];

  return (
    <DashboardLayout role="officer">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Verification History</h2>
          <p className="text-sm text-slate-500">Audit log of all document verification decisions.</p>
        </div>
        <Card>
          <DataTable
            columns={columns}
            data={history}
            searchable
            searchPlaceholder="Search by student, app number, or document..."
            emptyMessage={loading ? 'Loading verification history...' : 'No verification actions recorded yet.'}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
