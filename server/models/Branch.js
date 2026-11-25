import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true, trim: true },
    qualificationRequired: { type: String, default: '12th' },
    minMarks: { type: Number, default: 50 },
    requiredSubjects: [{ type: String }],
    entranceExamRequired: { type: Boolean, default: false },
    entranceExamName: { type: String },
    requiredDocuments: {
      type: [{ name: String, required: Boolean }],
      default: [
        { name: '10th Marksheet', required: true },
        { name: '12th Marksheet', required: true },
        { name: 'Aadhar Card', required: true },
        { name: 'Passport Photo', required: true },
        { name: 'Category Certificate', required: false },
      ],
    },
    fees: {
      tuition: { type: Number, default: 0 },
      registration: { type: Number, default: 5000 },
      other: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    totalSeats: { type: Number, default: 60 },
    reservedSeats: { type: Number, default: 0 },
    confirmedSeats: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Branch', branchSchema);

