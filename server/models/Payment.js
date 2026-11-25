import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiptNumber: { type: String, unique: true, sparse: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'verified', 'failed'], default: 'created' },
    receiptPath: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);

