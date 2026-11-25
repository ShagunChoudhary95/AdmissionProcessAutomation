import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actor: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, unique: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    personalDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    academicDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    eligibilityResult: {
      isEligible: { type: Boolean, default: false },
      criteria: [{ label: String, required: String, achieved: String, passed: Boolean }],
      alternativeCourses: [{ courseId: mongoose.Schema.Types.ObjectId, branchId: mongoose.Schema.Types.ObjectId, course: String, branch: String, reason: String, fees: Number }],
      checkedAt: Date,
    },
    meritScore: { type: Number, default: null },
    meritRank: { type: Number, default: null },
    meritBreakdown: [{ label: String, score: Number }],
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Admin Review',
        'Correction Required',
        'Eligibility Approved',
        'Not Eligible',
        'Document Verification Pending',
        'Documents Verified',
        'Admission Offered',
        'Seat Reserved',
        'Payment Pending',
        'Admission Confirmed',
        'Rejected',
        'Waitlisted',
        'Offer Expired',
        'Withdrawn',
      ],
      default: 'Draft',
    },
    statusHistory: [statusHistorySchema],
    correctionRemarks: { type: String },
    adminRemarks: { type: String },
    offerExpiresAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);

