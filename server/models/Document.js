import mongoose from 'mongoose';

const docVersionSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  verificationStatus: {
    type: String,
    enum: ['Not Uploaded', 'Pending Verification', 'Verified', 'Re-upload Required', 'Rejected'],
    default: 'Pending Verification',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedByName: { type: String },
  verifiedAt: { type: Date },
  remarks: { type: String },
});

const documentSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: { type: String, required: true },
    requiredForCourse: { type: Boolean, default: true },
    versions: [docVersionSchema],
    currentVersion: {
      filePath: String,
      originalName: String,
      mimeType: String,
      uploadedAt: Date,
      verificationStatus: {
        type: String,
        enum: ['Not Uploaded', 'Pending Verification', 'Verified', 'Re-upload Required', 'Rejected'],
        default: 'Not Uploaded',
      },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedByName: String,
      verifiedAt: Date,
      remarks: String,
    },
  },
  { timestamps: true }
);

documentSchema.index({ applicationId: 1, documentType: 1 }, { unique: true });

export default mongoose.model('Document', documentSchema);

