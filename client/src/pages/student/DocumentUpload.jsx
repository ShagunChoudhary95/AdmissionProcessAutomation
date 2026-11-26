import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Eye, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { DocStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../utils/helpers';
import { documentService, applicationService } from '../../services';
import toast from 'react-hot-toast';

const statusIcons = {
  'Not Uploaded': <Upload className="w-4 h-4 text-slate-400" />,
  'Pending Verification': <Clock className="w-4 h-4 text-amber-500" />,
  Verified: <CheckCircle className="w-4 h-4 text-teal-600" />,
  'Re-upload Required': <RefreshCw className="w-4 h-4 text-orange-500" />,
  Rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

const defaultDocTypes = [
  { _id: '1', documentType: 'Class 10th Marksheet', required: true, currentVersion: { verificationStatus: 'Not Uploaded' } },
  { _id: '2', documentType: 'Class 12th Marksheet', required: true, currentVersion: { verificationStatus: 'Not Uploaded' } },
  { _id: '3', documentType: 'Passport Size Photograph', required: true, currentVersion: { verificationStatus: 'Not Uploaded' } },
  { _id: '4', documentType: 'Aadhaar Card / ID Proof', required: true, currentVersion: { verificationStatus: 'Not Uploaded' } },
  { _id: '5', documentType: 'Category Certificate', required: false, currentVersion: { verificationStatus: 'Not Uploaded' } },
];

export default function DocumentUpload() {
  const [docs, setDocs] = useState(defaultDocTypes);
  const [appId, setAppId] = useState(null);
  const [uploading, setUploading] = useState(null);
  const fileRefs = useRef({});

  useEffect(() => {
    async function loadDocs() {
      try {
        const appRes = await applicationService.getMy();
        const app = appRes.data.application || (appRes.data.applications && appRes.data.applications[0]);
        if (app?._id) {
          setAppId(app._id);
          const docRes = await documentService.list(app._id);
          const serverDocs = docRes.data.documents;
          if (serverDocs && serverDocs.length > 0) {
            setDocs(serverDocs);
          }
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
      }
    }
    loadDocs();
  }, []);

  const handleUpload = async (doc, file) => {
    if (!file) return;
    if (!appId) {
      toast.error('No active application found to upload documents to.');
      return;
    }
    setUploading(doc._id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', doc.documentType);

      let res;
      if (doc.currentVersion?.verificationStatus === 'Re-upload Required' && doc.id) {
        res = await documentService.reupload(appId, doc._id, formData);
      } else {
        res = await documentService.upload(appId, formData);
      }

      const uploadedDoc = res.data.document;
      setDocs(prev => prev.map(d => {
        if (d.documentType === doc.documentType || d._id === doc._id) {
          return uploadedDoc || {
            ...d,
            currentVersion: {
              ...d.currentVersion,
              filePath: file.name,
              originalFileName: file.name,
              uploadedAt: new Date().toISOString(),
              verificationStatus: 'Pending Verification',
              remarks: null,
            }
          };
        }
        return d;
      }));
      toast.success(`${doc.documentType} uploaded successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Upload failed. Please check file format and size.';
      toast.error(msg);
    } finally {
      setUploading(null);
    }
  };

  const verified = docs.filter(d => d.currentVersion.verificationStatus === 'Verified').length;
  const required = docs.filter(d => d.required).length;
  const needsReupload = docs.filter(d => d.currentVersion.verificationStatus === 'Re-upload Required');

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Document Upload</h2>
          <p className="text-sm text-slate-500">Upload all required documents. Each document will be verified individually.</p>
        </div>

        {/* Summary bar */}
        <Card>
          <CardBody className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Verification Progress</span>
                <span className="font-semibold text-slate-700">{verified} / {required} verified</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${required > 0 ? (verified / required) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex gap-4 flex-shrink-0 text-xs text-center">
              {[
                { label: 'Verified', count: docs.filter(d => d.currentVersion.verificationStatus === 'Verified').length, color: 'text-teal-700' },
                { label: 'Pending', count: docs.filter(d => d.currentVersion.verificationStatus === 'Pending Verification').length, color: 'text-amber-700' },
                { label: 'Re-upload', count: needsReupload.length, color: 'text-orange-700' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Re-upload alerts */}
        {needsReupload.map(doc => (
          <div key={doc._id} className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Re-upload required: {doc.documentType}</p>
              <p className="text-sm text-orange-700 mt-0.5">{doc.currentVersion.remarks}</p>
            </div>
          </div>
        ))}

        {/* Document list */}
        <div className="space-y-3">
          {docs.map((doc) => {
            const cv = doc.currentVersion;
            const hasFile = !!cv.filePath;
            const needsAction = cv.verificationStatus === 'Not Uploaded' || cv.verificationStatus === 'Re-upload Required';

            return (
              <Card key={doc._id}>
                <CardBody className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {statusIcons[cv.verificationStatus]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{doc.documentType}</p>
                      {doc.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                      {!doc.required && <span className="text-xs text-slate-400 font-medium">Optional</span>}
                    </div>
                    {hasFile && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {cv.filePath} · Uploaded {formatDateTime(cv.uploadedAt)}
                      </p>
                    )}
                    {cv.remarks && (
                      <p className="text-xs text-orange-700 mt-1 bg-orange-50 px-2 py-1 rounded">
                        {cv.remarks}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <DocStatusBadge status={cv.verificationStatus} />

                    {cv.verificationStatus !== 'Verified' && (
                      <>
                        <input
                          ref={el => fileRefs.current[doc._id] = el}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleUpload(doc, e.target.files?.[0])}
                        />
                        <Button
                          size="sm"
                          variant={needsAction ? (cv.verificationStatus === 'Re-upload Required' ? 'warning' : 'primary') : 'secondary'}
                          loading={uploading === doc._id}
                          leftIcon={<Upload className="w-3.5 h-3.5" />}
                          onClick={() => fileRefs.current[doc._id]?.click()}
                        >
                          {cv.verificationStatus === 'Re-upload Required' ? 'Re-upload' : hasFile ? 'Replace' : 'Upload'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-medium mb-1">Accepted formats</p>
          <p className="text-xs text-blue-700">PDF, JPG, JPEG, PNG · Maximum file size: 5 MB per document</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

