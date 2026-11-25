import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { formatDateTime } from '../../utils/helpers';

const statusHistory = [
  { status: 'Draft', timestamp: '2026-11-19T08:00:00Z', actor: 'You', note: 'Application created' },
  { status: 'Submitted', timestamp: '2026-11-20T10:30:00Z', actor: 'You', note: 'Application submitted for review' },
  { status: 'Under Admin Review', timestamp: '2026-11-20T11:00:00Z', actor: 'System', note: 'Application forwarded to admin for review' },
  { status: 'Eligibility Approved', timestamp: '2026-11-21T09:30:00Z', actor: 'Admin', note: 'Eligibility verified. Application approved for document submission.' },
  { status: 'Document Verification Pending', timestamp: '2026-11-21T09:31:00Z', actor: 'System', note: 'Awaiting document uploads and verification' },
];

const currentStatus = 'Document Verification Pending';

const statusDescriptions = {
  'Document Verification Pending': 'Your application has been approved for document verification. Please upload all required documents. A verification officer will review each document.',
  'Admission Offered': 'Congratulations! You have been offered admission. Please accept the offer and pay the admission fee within the specified deadline.',
  'Payment Pending': 'Please complete your fee payment to confirm your admission.',
  'Admission Confirmed': 'Your admission is confirmed. Welcome!',
};

export default function ApplicationStatus() {
  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Application Status & Timeline</h2>
          <p className="text-sm text-slate-500">Track every step of your admission journey.</p>
        </div>

        {/* Current status */}
        <Card>
          <CardBody className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Current Status</p>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={currentStatus} className="text-sm px-3 py-1" />
              </div>
              {statusDescriptions[currentStatus] && (
                <p className="text-sm text-slate-600 mt-3 max-w-md">{statusDescriptions[currentStatus]}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500">Application No.</p>
              <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">ADM2026-7K9P42</p>
            </div>
          </CardBody>
        </Card>

        {/* Progress tracker */}
        <Card>
          <CardHeader><CardTitle>Admission Progress</CardTitle></CardHeader>
          <CardBody className="py-8">
            <ProgressTracker status={currentStatus} />
          </CardBody>
        </Card>

        {/* Status history timeline */}
        <Card>
          <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
          <CardBody className="p-0">
            <div className="relative p-5">
              <div className="absolute left-9 top-5 bottom-5 w-px bg-slate-200" />
              <div className="space-y-6">
                {[...statusHistory].reverse().map((event, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${i === 0 ? 'bg-blue-700 border-blue-700' : 'bg-white border-slate-300'}`}>
                      {i === 0
                        ? <div className="w-2 h-2 bg-white rounded-full" />
                        : <div className="w-2 h-2 bg-slate-300 rounded-full" />
                      }
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={event.status} />
                        <span className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</span>
                        <span className="text-xs text-slate-500">· by {event.actor}</span>
                      </div>
                      {event.note && <p className="text-sm text-slate-600 mt-1">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

