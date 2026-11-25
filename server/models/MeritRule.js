import mongoose from 'mongoose';

const formulaPartSchema = new mongoose.Schema({
  component: { type: String, required: true },
  source: { type: String, required: true },
  weight: { type: Number, required: true },
});

const meritRuleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    description: { type: String },
    formula: [formulaPartSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('MeritRule', meritRuleSchema);

