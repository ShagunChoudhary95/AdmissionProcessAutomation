import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Eye, Download, FileText } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { DocStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReasonModal, Modal } from '../../components/ui/Modal';
import { formatDateTime } from '../../utils/helpers';
import { sampleDocuments, sampleApplications } from '../../data/sampleData';
import toast from 'react-hot-toast';

export default function DocumentVerification() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const app = sampleApplications.find((a) => a._id === applicationId) || sampleApplications[0];

  const [docs, setDocs] = useState(
    sampleDocuments.map((d) => ({
      ...d,
      history: d.currentVersion.verifiedAt
        ? [{ officer: 'Officer A. Singh', decision: d.currentVersion.verificationStatus, timestamp: d.currentVersion.uploadedAt, remarks: d.currentVersion.remarks }]
        : [],
    }))
  );
  const [reasonModal, setReasonModal] = useState({ open: false, docId: null, action: null });
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleVerify = (docId) => {
    setDocs((prev) =>
      prev.map((d) =>
        d._id === docId
          ? {
              ...d,
              currentVersion: {
                ...d.currentVersion,
                verificationStatus: 'Verified',
                remarks: 'Verified by officer',
              },
              history: [
                ...d.history,
                { officer: 'Current Officer', decision: 'Verified', timestamp: new Date().toISOString(), remarks: 'Document clear and valid' },
              ],
            }
          : d
      )
    );
    toast.success('Document marked as Verified.');
  };

  const handleReasonSubmit = (reason) => {
    const { docId, action } = reasonModal;
    const newStatus = action === 'reject' ? 'Rejected' : 'Re-upload Required';
    setDocs((prev) =>
      prev.map((d) =>
        d._id === docId
          ? {
              ...d,
              currentVersion: {
                ...d.currentVersion,
                verificationStatus: newStatus,
                remarks: reason,
              },
              history: [
                ...d.history,
                { officer: 'Current Officer', decision: newStatus, timestamp: new Date().toISOString(), remarks: reason },
              ],
            }
          : d
      )
    );
    toast.success(`Document marked as ${newStatus}.`);
    setReasonModal({ open: false, docId: null, action: null });
  };

  return (
    <DashboardLayout role="officer">
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/officer/queue')}>
            Back to Queue
          </Button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">{app.studentName}</h2>
            <p className="text-xs text-slate-500">
              <span className="font-mono font-semibold text-blue-700">{app.applicationNumber}</span> · {app.course} — {app.branch}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {docs.map((doc) => {
            const cv = doc.currentVersion;
            const hasFile = !!cv.filePath;

            return (
              <Card key={doc._id}>
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{doc.documentType}</p>
                          <DocStatusBadge status={cv.verificationStatus} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {hasFile ? `${cv.filePath} · Uploaded ${formatDateTime(cv.uploadedAt)}` : 'Not uploaded by student yet'}
                        </p>
                      </div>
                    </div>

                    {hasFile && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="secondary" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setPreviewDoc(doc)}>
                          Preview
                        </Button>
                        <Button size="sm" variant="success" leftIcon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handleVerify(doc._id)}>
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                          onClick={() => setReasonModal({ open: true, docId: doc._id, action: 'reupload' })}
                        >
                          Request Re-upload
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => setReasonModal({ open: true, docId: doc._id, action: 'reject' })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>

                  {cv.remarks && (
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700">
                      <span className="font-semibold">Remarks:</span> {cv.remarks}
                    </div>
                  )}

                  {doc.history.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">Verification History</p>
                      <div className="space-y-1">
                        {doc.history.map((h, i) => (
                          <div key={i} className="text-xs text-slate-600 flex items-center justify-between">
                            <span>
                              <span className="font-medium">{h.decision}</span> by {h.officer} — {h.remarks}
                            </span>
                            <span className="text-slate-400">{formatDateTime(h.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      <ReasonModal
        open={reasonModal.open}
        onClose={() => setReasonModal({ open: false, docId: null, action: null })}
        title={reasonModal.action === 'reject' ? 'Reject Document' : 'Request Document Re-upload'}
        placeholder="Mandatory reason for rejection / re-upload..."
        onSubmit={handleReasonSubmit}
      />

      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} title={`Document Preview — ${previewDoc?.documentType}`} size="lg">
        <div className="p-6 space-y-4">
          <div className="h-80 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-12 h-12 mb-2 text-slate-400" />
            <p className="text-sm font-medium">{previewDoc?.currentVersion?.filePath}</p>
            <p className="text-xs mt-1">Secure authenticated document stream will render here in Phase 5/6.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast.success('Secure download triggered.')}>
              Download Copy
            </Button>
            <Button onClick={() => setPreviewDoc(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

