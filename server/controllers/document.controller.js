import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import Application from '../models/Application.js';

export async function listDocuments(req, res) {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'student' && String(app.studentId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const documents = await Document.find({ applicationId: app._id });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { documentType } = req.body;
    const app = await Application.findOne({ _id: req.params.applicationId, studentId: req.user._id });
    if (!app) return res.status(404).json({ message: 'Application not found' });

    let doc = await Document.findOne({ applicationId: app._id, documentType });
    const versionEntry = {
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      verificationStatus: 'Pending Verification',
      remarks: null,
    };

    if (!doc) {
      doc = await Document.create({
        applicationId: app._id,
        studentId: req.user._id,
        documentType,
        versions: [versionEntry],
        currentVersion: versionEntry,
      });
    } else {
      doc.versions.push(versionEntry);
      doc.currentVersion = versionEntry;
      await doc.save();
    }

    if (app.status === 'Eligibility Approved') {
      app.status = 'Document Verification Pending';
      app.statusHistory.push({
        status: 'Document Verification Pending',
        actor: 'System',
        note: 'Documents uploaded, awaiting verification',
      });
      await app.save();
    }

    res.json({ document: doc, message: 'Document uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function reuploadDocument(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const doc = await Document.findOne({
      _id: req.params.docId,
      applicationId: req.params.applicationId,
      studentId: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const versionEntry = {
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      verificationStatus: 'Pending Verification',
      remarks: null,
    };

    doc.versions.push(versionEntry);
    doc.currentVersion = versionEntry;
    await doc.save();

    res.json({ document: doc, message: 'Document re-uploaded and queued for verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function serveDocumentFile(req, res) {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'student' && String(app.studentId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const doc = await Document.findOne({ _id: req.params.docId, applicationId: app._id });
    if (!doc || !doc.currentVersion?.filePath) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    const filePath = path.resolve(doc.currentVersion.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on server' });
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

