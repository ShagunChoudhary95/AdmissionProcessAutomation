import Application from '../models/Application.js';
import Document from '../models/Document.js';
import { notifyUser } from '../services/email.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getOfficerStats(req, res) {
  try {
    const [pending, verified, reupload, rejected] = await Promise.all([
      Document.countDocuments({ 'currentVersion.verificationStatus': 'Pending Verification' }),
      Document.countDocuments({ 'currentVersion.verificationStatus': 'Verified' }),
      Document.countDocuments({ 'currentVersion.verificationStatus': 'Re-upload Required' }),
      Document.countDocuments({ 'currentVersion.verificationStatus': 'Rejected' }),
    ]);
    res.json({ stats: { pending, verified, reupload, rejected } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getQueue(req, res) {
  try {
    const apps = await Application.find({
      status: { $in: ['Document Verification Pending', 'Documents Verified', 'Eligibility Approved'] },
    })
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('branchId', 'name')
      .sort({ submittedAt: 1 })
      .lean();

    const appIds = apps.map((a) => a._id);
    const docs = await Document.find({ applicationId: { $in: appIds } }).lean();

    const queue = apps.map((app) => {
      const appDocs = docs.filter((d) => String(d.applicationId) === String(app._id));
      return {
        ...app,
        totalDocs: appDocs.length,
        verifiedDocs: appDocs.filter((d) => d.currentVersion?.verificationStatus === 'Verified').length,
        pendingDocs: appDocs.filter((d) => d.currentVersion?.verificationStatus === 'Pending Verification').length,
      };
    });

    res.json({ queue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getApplicationDocuments(req, res) {
  try {
    const app = await Application.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('branchId', 'name');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const documents = await Document.find({ applicationId: app._id });
    res.json({ application: app, documents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function checkAndMarkAllDocsVerified(applicationId, officer) {
  const docs = await Document.find({ applicationId });
  const requiredDocs = docs.filter((d) => d.requiredForCourse);
  const allVerified = requiredDocs.length > 0 && requiredDocs.every((d) => d.currentVersion?.verificationStatus === 'Verified');

  if (allVerified) {
    const app = await Application.findById(applicationId).populate('studentId');
    if (app && app.status === 'Document Verification Pending') {
      app.status = 'Documents Verified';
      app.statusHistory.push({
        status: 'Documents Verified',
        actor: officer.name,
        actorId: officer._id,
        note: 'All required documents verified',
      });
      await app.save();

      await notifyUser({
        userId: app.studentId._id,
        email: app.studentId.email,
        title: 'All Documents Verified',
        message: `All required documents for application ${app.applicationNumber} have been verified. Your application is now ready for final admission offer.`,
        type: 'success',
        relatedEntity: { type: 'Application', id: app._id },
      });
    }
  }
}

export async function verifyDocument(req, res) {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const remarks = req.body?.remarks || 'Verified by officer';
    doc.currentVersion.verificationStatus = 'Verified';
    doc.currentVersion.verifiedBy = req.user._id;
    doc.currentVersion.verifiedByName = req.user.name;
    doc.currentVersion.verifiedAt = new Date();
    doc.currentVersion.remarks = remarks;

    if (doc.versions.length > 0) {
      const latest = doc.versions[doc.versions.length - 1];
      latest.verificationStatus = 'Verified';
      latest.verifiedBy = req.user._id;
      latest.verifiedByName = req.user.name;
      latest.verifiedAt = new Date();
      latest.remarks = remarks;
    }

    await doc.save();
    await checkAndMarkAllDocsVerified(doc.applicationId, req.user);

    await logAudit({
      user: req.user,
      action: 'verify_document',
      entityType: 'Document',
      entityId: doc._id,
      details: { documentType: doc.documentType, remarks },
      req,
    });

    res.json({ document: doc, message: 'Document verified.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export function rejectOrRequestReupload(statusType) {
  return async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: 'Reason is mandatory when rejecting or requesting re-upload.' });
      }

      const doc = await Document.findById(req.params.docId);
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      doc.currentVersion.verificationStatus = statusType;
      doc.currentVersion.verifiedBy = req.user._id;
      doc.currentVersion.verifiedByName = req.user.name;
      doc.currentVersion.verifiedAt = new Date();
      doc.currentVersion.remarks = reason;

      if (doc.versions.length > 0) {
        const latest = doc.versions[doc.versions.length - 1];
        latest.verificationStatus = statusType;
        latest.verifiedBy = req.user._id;
        latest.verifiedByName = req.user.name;
        latest.verifiedAt = new Date();
        latest.remarks = reason;
      }

      await doc.save();

      const app = await Application.findById(doc.applicationId).populate('studentId');
      if (app?.studentId) {
        await notifyUser({
          userId: app.studentId._id,
          email: app.studentId.email,
          title: `Document ${statusType}: ${doc.documentType}`,
          message: `Your ${doc.documentType} for application ${app.applicationNumber} was marked "${statusType}". Reason: ${reason}`,
          type: 'warning',
          relatedEntity: { type: 'Document', id: doc._id },
        });
      }

      await logAudit({
        user: req.user,
        action: statusType === 'Rejected' ? 'reject_document' : 'request_reupload_document',
        entityType: 'Document',
        entityId: doc._id,
        details: { documentType: doc.documentType, reason },
        req,
      });

      res.json({ document: doc, message: `Document marked as ${statusType}.` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

export async function getVerificationHistory(req, res) {
  try {
    const docs = await Document.find({ 'currentVersion.verifiedAt': { $ne: null } })
      .populate({ path: 'applicationId', select: 'applicationNumber' })
      .populate({ path: 'studentId', select: 'name' })
      .sort({ 'currentVersion.verifiedAt': -1 })
      .limit(100)
      .lean();

    const history = docs.map((d) => ({
      _id: d._id,
      applicationNumber: d.applicationId?.applicationNumber,
      studentName: d.studentId?.name,
      documentType: d.documentType,
      decision: d.currentVersion?.verificationStatus,
      officer: d.currentVersion?.verifiedByName,
      remarks: d.currentVersion?.remarks,
      timestamp: d.currentVersion?.verifiedAt,
    }));

    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

