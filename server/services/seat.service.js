import Branch from '../models/Branch.js';
import SeatReservation from '../models/SeatReservation.js';

/**
 * Atomically reserve a seat for an application.
 * Uses findOneAndUpdate with $expr to guarantee no overbooking under concurrency.
 */
export async function reserveSeat({ applicationId, branchId, studentId, ttlHours = 72 }) {
  // Release any expired reservations first
  await releaseExpiredReservations(branchId);

  const existing = await SeatReservation.findOne({ applicationId, status: { $in: ['reserved', 'confirmed'] } });
  if (existing) return existing;

  const updatedBranch = await Branch.findOneAndUpdate(
    {
      _id: branchId,
      isActive: true,
      $expr: {
        $lt: [{ $add: ['$reservedSeats', '$confirmedSeats'] }, '$totalSeats'],
      },
    },
    { $inc: { reservedSeats: 1 } },
    { new: true }
  );

  if (!updatedBranch) {
    throw new Error('No seats available in the selected branch');
  }

  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const reservation = await SeatReservation.create({
    applicationId,
    branchId,
    studentId,
    status: 'reserved',
    expiresAt,
  });

  return reservation;
}

/**
 * Confirm a reserved seat when payment is verified.
 */
export async function confirmSeat({ applicationId, branchId, studentId }) {
  const reservation = await SeatReservation.findOne({ applicationId });

  if (reservation && reservation.status === 'confirmed') {
    return reservation;
  }

  if (reservation && reservation.status === 'reserved') {
    await Branch.findByIdAndUpdate(branchId, {
      $inc: { reservedSeats: -1, confirmedSeats: 1 },
    });
    reservation.status = 'confirmed';
    reservation.confirmedAt = new Date();
    await reservation.save();
    return reservation;
  }

  // Direct confirmation if offer didn't pre-reserve
  const updatedBranch = await Branch.findOneAndUpdate(
    {
      _id: branchId,
      isActive: true,
      $expr: {
        $lt: [{ $add: ['$reservedSeats', '$confirmedSeats'] }, '$totalSeats'],
      },
    },
    { $inc: { confirmedSeats: 1 } },
    { new: true }
  );

  if (!updatedBranch) {
    throw new Error('No seats available to confirm admission');
  }

  return SeatReservation.create({
    applicationId,
    branchId,
    studentId,
    status: 'confirmed',
    expiresAt: new Date(),
    confirmedAt: new Date(),
  });
}

export async function releaseExpiredReservations(branchId = null) {
  const query = {
    status: 'reserved',
    expiresAt: { $lt: new Date() },
  };
  if (branchId) query.branchId = branchId;

  const expired = await SeatReservation.find(query);
  for (const resv of expired) {
    resv.status = 'expired';
    await resv.save();
    await Branch.findOneAndUpdate(
      { _id: resv.branchId, reservedSeats: { $gt: 0 } },
      { $inc: { reservedSeats: -1 } }
    );
  }
  return expired.length;
}

