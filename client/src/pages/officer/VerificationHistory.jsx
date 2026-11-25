import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { DocStatusBadge } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/helpers';

const historyData = [
  { _id: 'h1', applicationNumber: 'ADM2026-7K9P42', studentName: 'Priya Sharma', documentType: 'Aadhar Card', decision: 'Verified', officer: 'R. Kulkarni', timestamp: '2026-11-22T13:50:00Z', remarks: 'Clear ID proof' },
  { _id: 'h2', applicationNumber: 'ADM2026-7K9P42', studentName: 'Priya Sharma', documentType: 'Passport Photo', decision: 'Re-upload Required', officer: 'R. Kulkarni', timestamp: '2026-11-22T14:00:00Z', remarks: 'Photo is blurry. Please upload a clear photograph.' },
  { _id: 'h3', applicationNumber: 'ADM2026-9M2X81', studentName: 'Rahul Verma', documentType: '12th Marksheet', decision: 'Verified', officer: 'S. Iyer', timestamp: '2026-11-21T16:15:00Z', remarks: 'Matched with entered marks' },
  { _id: 'h4', applicationNumber: 'ADM2026-6C8R55', studentName: 'Karan Mehta', documentType: 'Transfer Certificate', decision: 'Rejected', officer: 'R. Kulkarni', timestamp: '2026-11-20T11:30:00Z', remarks: 'Missing school principal stamp' },
];

export default function VerificationHistory() {
  const columns = [
    { header: 'App. No.', accessor: 'applicationNumber', render: (r) => <span className="font-mono text-xs text-blue-700 font-semibold">{r.applicationNumber}</span> },
    { header: 'Student', accessor: 'studentName', sortable: true },
    { header: 'Document', accessor: 'documentType', sortable: true },
    { header: 'Decision', accessor: 'decision', render: (r) => <DocStatusBadge status={r.decision} /> },
    { header: 'Officer', accessor: 'officer' },
    { header: 'Remarks', accessor: 'remarks' },
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
          <DataTable columns={columns} data={historyData} searchable searchPlaceholder="Search by student, app number, or document..." />
        </Card>
      </div>
    </DashboardLayout>
  );
}

