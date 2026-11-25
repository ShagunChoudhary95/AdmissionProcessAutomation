import mongoose from 'mongoose';

const seatReservationSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['reserved', 'confirmed', 'expired', 'released'], default: 'reserved' },
    reservedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('SeatReservation', seatReservationSchema);

