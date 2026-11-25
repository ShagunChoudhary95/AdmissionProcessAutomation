import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Application from '../models/Application.js';
import Branch from '../models/Branch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { confirmSeat } from '../services/seat.service.js';
import { generateReceiptPDF } from '../services/pdf.service.js';
import { notifyUser } from '../services/email.service.js';

function getRazorpayInstance() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
}

export async function createOrder(req, res) {
  try {
    const { applicationId } = req.body;
    const app = await Application.findOne({ _id: applicationId, studentId: req.user._id }).populate('branchId');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (!['Admission Offered', 'Seat Reserved', 'Payment Pending'].includes(app.status)) {
      return res.status(400).json({ message: 'Payment is not allowed at current application stage' });
    }

    // Prevent duplicate verified payment
    const existingPaid = await Payment.findOne({ applicationId: app._id, status: 'verified' });
    if (existingPaid) {
      return res.status(409).json({ message: 'Fee has already been paid and verified for this application.' });
    }

    const amountINR = app.branchId?.fees?.total || 100000;
    const amountPaise = amountINR * 100;

    const rzp = getRazorpayInstance();
    let order;
    if (rzp) {
      order = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: app.applicationNumber,
      });
    } else {
      // Test mode fallback when Razorpay keys are not set in .env
      order = {
        id: `order_test_${crypto.randomBytes(6).toString('hex')}`,
        amount: amountPaise,
        currency: 'INR',
      };
    }

    const payment = await Payment.create({
      applicationId: app._id,
      studentId: req.user._id,
      razorpayOrderId: order.id,
      amount: amountINR,
      currency: 'INR',
      status: 'created',
    });

    if (app.status !== 'Payment Pending') {
      app.status = 'Payment Pending';
      app.statusHistory.push({
        status: 'Payment Pending',
        actor: req.user.name,
        actorId: req.user._id,
        note: 'Payment order initiated',
      });
      await app.save();
    }

    res.json({
      orderId: order.id,
      amount: amountPaise,
      amountINR,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      paymentId: payment._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { applicationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, applicationId });
    if (!payment) return res.status(404).json({ message: 'Payment order not found' });

    if (payment.status === 'verified') {
      return res.status(409).json({ message: 'Payment already verified' });
    }

    // Verify Razorpay signature on backend
    if (process.env.RAZORPAY_KEY_SECRET) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        payment.status = 'failed';
        await payment.save();
        return res.status(400).json({ message: 'Payment signature verification failed' });
      }
    }

    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    // Confirm seat atomically
    await confirmSeat({
      applicationId: app._id,
      branchId: app.branchId,
      studentId: app.studentId,
    });

    payment.razorpayPaymentId = razorpay_payment_id || `pay_test_${crypto.randomBytes(6).toString('hex')}`;
    payment.razorpaySignature = razorpay_signature || 'verified_test_sig';
    payment.status = 'verified';
    payment.verifiedAt = new Date();
    payment.receiptNumber = `RCPT-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await payment.save();

    app.status = 'Admission Confirmed';
    app.statusHistory.push({
      status: 'Admission Confirmed',
      actor: 'System',
      note: `Payment verified (${payment.receiptNumber}). Admission confirmed.`,
    });
    await app.save();

    await notifyUser({
      userId: req.user._id,
      email: req.user.email,
      title: 'Admission Confirmed & Payment Verified',
      message: `Your fee payment of INR ${payment.amount} is verified (Receipt: ${payment.receiptNumber}). Your admission for ${app.applicationNumber} is confirmed!`,
      type: 'success',
      relatedEntity: { type: 'Payment', id: payment._id },
    });

    res.json({ payment, application: app, message: 'Payment verified and admission confirmed!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function downloadReceipt(req, res) {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'student' && String(app.studentId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payment = await Payment.findOne({ applicationId: app._id, status: 'verified' });
    if (!payment) {
      return res.status(404).json({ message: 'No verified payment found for this application' });
    }

    const [student, course, branch] = await Promise.all([
      User.findById(app.studentId),
      Course.findById(app.courseId),
      Branch.findById(app.branchId),
    ]);

    const pdfBuffer = await generateReceiptPDF({ payment, application: app, student, course, branch });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.receiptNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

