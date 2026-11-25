import mongoose from 'mongoose';

const criterionSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: { type: String, enum: ['gte', 'gt', 'lte', 'eq', 'includes'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const eligibilityRuleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    description: { type: String, required: true },
    criteria: [criterionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('EligibilityRule', eligibilityRuleSchema);

