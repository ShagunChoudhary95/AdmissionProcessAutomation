import mongoose from 'mongoose';

const qualificationSchema = new mongoose.Schema({
  level: { type: String, required: true },
  board: { type: String, required: true },
  schoolCollege: { type: String, required: true },
  yearOfPassing: { type: String, required: true },
  marksType: { type: String, default: 'Percentage' },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  subjects: { type: String },
  rollNumber: { type: String },
});

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personal: {
      dob: String,
      gender: String,
      phone: String,
      alternatePhone: String,
      category: String,
      religion: String,
      nationality: { type: String, default: 'Indian' },
      domicileState: String,
      parentName: String,
      parentPhone: String,
      parentOccupation: String,
      annualIncome: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
    },
    academic: {
      qualifications: [qualificationSchema],
      hasEntranceExam: { type: Boolean, default: false },
      entranceExamName: String,
      entranceExamRollNo: String,
      entranceExamScore: Number,
      entranceExamRank: Number,
      hasGap: { type: Boolean, default: false },
      gapReason: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('StudentProfile', studentProfileSchema);

