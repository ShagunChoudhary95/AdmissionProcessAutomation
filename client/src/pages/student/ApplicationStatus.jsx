import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { formatDateTime } from '../../utils/helpers';
import { applicationService } from '../../services';

const statusDescriptions = {
  'DRAFT': 'Your application is currently in draft mode. Please select your course and complete submission.',
  'SUBMITTED': 'Your application has been submitted and is currently queued for verification.',
  'UNDER_ADMIN_REVIEW': 'Your application is currently being reviewed by the admissions team.',
  'UNDER_VERIFICATION': 'Your uploaded documents are undergoing verification by the verification officer.',
  'VERIFIED': 'All your documents and qualifications have been successfully verified.',
  'OFFER_ISSUED': 'Congratulations! You have been offered admission. Please pay the admission fee within 7 days to confirm your seat.',
  'ADMISSION_OFFERED': 'Congratulations! You have been offered admission. Please accept the offer and pay the admission fee within the specified deadline.',
  'PAYMENT_PENDING': 'Please complete your fee payment to confirm your admission.',
  'ADMISSION_CONFIRMED': 'Your admission is confirmed. Welcome to ABES Engineering College!',
  'CORRECTION_REQUIRED': 'Some documents or details require correction. Please review the officer remarks and update accordingly.',
  'REJECTED': 'Your application could not be approved at this time. Please check remarks for further details.',
  'Draft': 'Your application is currently in draft mode. Please select your course and complete submission.',
  'Submitted': 'Your application has been submitted and is currently queued for verification.',
  'Under Admin Review': 'Your application is currently being reviewed by the admissions team.',
  'Under Verification': 'Your uploaded documents are undergoing verification by the verification officer.',
  'Document Verification Pending': 'Your application has been approved for document verification. Please upload all required documents. A verification officer will review each document.',
  'Verified': 'All your documents and qualifications have been successfully verified.',
  'Offer Issued': 'Congratulations! You have been offered admission. Please pay the admission fee within 7 days to confirm your seat.',
  'Admission Offered': 'Congratulations! You have been offered admission. Please accept the offer and pay the admission fee within the specified deadline.',
  'Payment Pending': 'Please complete your fee payment to confirm your admission.',
  'Admission Confirmed': 'Your admission is confirmed. Welcome to ABES Engineering College!',
  'Correction Required': 'Some documents or details require correction. Please review the officer remarks and update accordingly.',
  'Rejected': 'Your application could not be approved at this time. Please check remarks for further details.',
};

export default function ApplicationStatus() {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const myAppRes = await applicationService.getMy();
        const liveApp = myAppRes.data.application || (myAppRes.data.applications && myAppRes.data.applications[0]);
        const appId = liveApp?._id || liveApp?.id;
        if (appId) {
          const statusRes = await applicationService.getStatus(appId);
          setApp(statusRes.data);
        }
      } catch (err) {
        console.error('Failed to load status:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  const currentStatus = app?.status || 'Draft';
  const historyList = (app?.statusHistory || []).map(h => ({
    status: h.toStatus || h.status,
    timestamp: h.timestamp,
    actor: h.actor || (h.changedBy ? h.changedBy.name : 'System'),
    note: h.remarks || h.note,
  }));

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
              <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{app?.applicationNumber || '—'}</p>
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
                {historyList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No activity history yet.</p>
                ) : (
                  [...historyList].reverse().map((event, i) => (
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
                  ))
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

