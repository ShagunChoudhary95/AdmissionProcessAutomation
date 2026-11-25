import Application from '../models/Application.js';
import Course from '../models/Course.js';
import Branch from '../models/Branch.js';
import EligibilityRule from '../models/EligibilityRule.js';
import MeritRule from '../models/MeritRule.js';
import User from '../models/User.js';
import { reserveSeat } from '../services/seat.service.js';
import { notifyUser } from '../services/email.service.js';
import { logAudit } from '../services/audit.service.js';

export async function getDashboardStats(req, res) {
  try {
    const [
      totalApplications,
      pendingReview,
      eligibleApplications,
      ineligibleApplications,
      pendingDocVerification,
      documentsVerified,
      admissionsConfirmed,
    ] = await Promise.all([
      Application.countDocuments({ status: { $ne: 'Draft' } }),
      Application.countDocuments({ status: { $in: ['Submitted', 'Under Admin Review'] } }),
      Application.countDocuments({ 'eligibilityResult.isEligible': true }),
      Application.countDocuments({ status: 'Not Eligible' }),
      Application.countDocuments({ status: 'Document Verification Pending' }),
      Application.countDocuments({ status: 'Documents Verified' }),
      Application.countDocuments({ status: 'Admission Confirmed' }),
    ]);

    res.json({
      stats: {
        totalApplications,
        pendingReview,
        eligibleApplications,
        ineligibleApplications,
        pendingDocVerification,
        documentsVerified,
        admissionsConfirmed,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listApplications(req, res) {
  try {
    const { status, courseId, search } = req.query;
    const filter = { status: { $ne: 'Draft' } };
    if (status && status !== 'All') filter.status = status;
    if (courseId && courseId !== 'All') filter.courseId = courseId;

    const apps = await Application.find(filter)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'name')
      .populate('branchId', 'name fees')
      .sort({ createdAt: -1 })
      .lean();

    const filtered = search
      ? apps.filter((a) => {
          const q = search.toLowerCase();
          return (
            a.applicationNumber?.toLowerCase().includes(q) ||
            a.studentId?.name?.toLowerCase().includes(q) ||
            a.studentId?.email?.toLowerCase().includes(q)
          );
        })
      : apps;

    res.json({ applications: filtered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getApplicationDetail(req, res) {
  try {
    const app = await Application.findById(req.params.id)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'name')
      .populate('branchId', 'name fees minMarks totalSeats confirmedSeats reservedSeats');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function reviewApplication(req, res) {
  try {
    const { action, reason } = req.body;
    const app = await Application.findById(req.params.id).populate('studentId');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (action === 'approve') {
      app.status = 'Document Verification Pending';
      app.statusHistory.push({
        status: 'Eligibility Approved',
        actor: req.user.name,
        actorId: req.user._id,
        note: 'Approved by Admin',
      });
      app.statusHistory.push({
        status: 'Document Verification Pending',
        actor: 'System',
        note: 'Moved to document verification queue',
      });
      await notifyUser({
        userId: app.studentId._id,
        email: app.studentId.email,
        title: 'Application Approved for Document Verification',
        message: `Your application ${app.applicationNumber} has passed admin review. Please upload all required documents.`,
        relatedEntity: { type: 'Application', id: app._id },
      });
    } else if (action === 'correction') {
      if (!reason) return res.status(400).json({ message: 'Correction remarks are required' });
      app.status = 'Correction Required';
      app.correctionRemarks = reason;
      app.statusHistory.push({
        status: 'Correction Required',
        actor: req.user.name,
        actorId: req.user._id,
        note: reason,
      });
      await notifyUser({
        userId: app.studentId._id,
        email: app.studentId.email,
        title: 'Correction Requested on Application',
        message: `Admin requested corrections on ${app.applicationNumber}: ${reason}`,
        type: 'warning',
        relatedEntity: { type: 'Application', id: app._id },
      });
    } else if (action === 'reject') {
      if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });
      app.status = 'Rejected';
      app.adminRemarks = reason;
      app.statusHistory.push({
        status: 'Rejected',
        actor: req.user.name,
        actorId: req.user._id,
        note: reason,
      });
      await notifyUser({
        userId: app.studentId._id,
        email: app.studentId.email,
        title: 'Application Rejected',
        message: `Your application ${app.applicationNumber} was rejected. Reason: ${reason}`,
        type: 'error',
        relatedEntity: { type: 'Application', id: app._id },
      });
    } else {
      return res.status(400).json({ message: 'Invalid review action' });
    }

    await app.save();
    await logAudit({
      user: req.user,
      action: `application_${action}`,
      entityType: 'Application',
      entityId: app._id,
      details: { reason },
      req,
    });

    res.json({ application: app, message: `Application ${action}d.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function issueOffer(req, res) {
  try {
    const { remarks } = req.body;
    const app = await Application.findById(req.params.id).populate('studentId');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (!['Documents Verified', 'Waitlisted'].includes(app.status)) {
      return res.status(400).json({ message: 'Admission offer can only be issued after documents are verified.' });
    }

    await reserveSeat({
      applicationId: app._id,
      branchId: app.branchId,
      studentId: app.studentId._id,
      ttlHours: 72,
    });

    app.status = 'Admission Offered';
    app.adminRemarks = remarks;
    app.offerExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    app.statusHistory.push({
      status: 'Admission Offered',
      actor: req.user.name,
      actorId: req.user._id,
      note: remarks || 'Admission offer issued & seat temporarily reserved for 72 hours',
    });

    await app.save();
    await notifyUser({
      userId: app.studentId._id,
      email: app.studentId.email,
      title: 'Admission Offer Issued!',
      message: `Congratulations! An admission offer has been issued for application ${app.applicationNumber}. Please complete fee payment within 72 hours to confirm your seat.`,
      type: 'success',
      relatedEntity: { type: 'Application', id: app._id },
    });

    await logAudit({
      user: req.user,
      action: 'issue_admission_offer',
      entityType: 'Application',
      entityId: app._id,
      details: { remarks },
      req,
    });

    res.json({ application: app, message: 'Admission offer issued and seat reserved.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getMeritList(req, res) {
  try {
    const filter = { 'eligibilityResult.isEligible': true, meritScore: { $ne: null } };
    if (req.params.branchId && req.params.branchId !== 'all') {
      filter.branchId = req.params.branchId;
    }

    const apps = await Application.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('branchId', 'name')
      .sort({ meritScore: -1 })
      .lean();

    const ranked = apps.map((a, idx) => ({ ...a, meritRank: idx + 1 }));
    res.json({ meritList: ranked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCoursesAdmin(req, res) {
  const courses = await Course.find().sort({ name: 1 });
  res.json({ courses });
}

export async function createCourse(req, res) {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getBranchesAdmin(req, res) {
  const branches = await Branch.find().populate('courseId', 'name').sort({ name: 1 });
  res.json({ branches });
}

export async function createBranch(req, res) {
  try {
    const data = { ...req.body };
    if (data.fees && !data.fees.total) {
      data.fees.total = Number(data.fees.tuition || 0) + Number(data.fees.registration || 0) + Number(data.fees.other || 0);
    }
    const branch = await Branch.create(data);
    res.status(201).json({ branch });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateBranch(req, res) {
  try {
    const data = { ...req.body };
    if (data.fees && !data.fees.total) {
      data.fees.total = Number(data.fees.tuition || 0) + Number(data.fees.registration || 0) + Number(data.fees.other || 0);
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ branch });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getEligibilityRules(req, res) {
  const rules = await EligibilityRule.find().populate('courseId', 'name').populate('branchId', 'name');
  res.json({ rules });
}

export async function createEligibilityRule(req, res) {
  const rule = await EligibilityRule.create(req.body);
  res.status(201).json({ rule });
}

export async function updateEligibilityRule(req, res) {
  const rule = await EligibilityRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ rule });
}

export async function getMeritRules(req, res) {
  const rules = await MeritRule.find().populate('courseId', 'name').populate('branchId', 'name');
  res.json({ rules });
}

export async function createMeritRule(req, res) {
  const rule = await MeritRule.create(req.body);
  res.status(201).json({ rule });
}

export async function updateMeritRule(req, res) {
  const rule = await MeritRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ rule });
}

export async function getSeats(req, res) {
  const branches = await Branch.find().populate('courseId', 'name').lean();
  const seats = branches.map((b) => ({
    branchId: b._id,
    course: b.courseId?.name,
    branch: b.name,
    total: b.totalSeats,
    reserved: b.reservedSeats,
    confirmed: b.confirmedSeats,
    available: Math.max(0, b.totalSeats - b.reservedSeats - b.confirmedSeats),
  }));
  res.json({ seats });
}

export async function updateSeats(req, res) {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    const newTotal = Number(req.body.totalSeats);
    if (newTotal < branch.reservedSeats + branch.confirmedSeats) {
      return res.status(400).json({ message: 'Capacity cannot be less than occupied seats' });
    }
    branch.totalSeats = newTotal;
    await branch.save();
    res.json({ branch });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getReports(req, res) {
  try {
    const courses = await Course.find().lean();
    const apps = await Application.find({ status: { $ne: 'Draft' } }).lean();
    const byCourse = courses.map((c) => {
      const courseApps = apps.filter((a) => String(a.courseId) === String(c._id));
      return {
        name: c.name,
        applied: courseApps.length,
        eligible: courseApps.filter((a) => a.eligibilityResult?.isEligible).length,
        admitted: courseApps.filter((a) => a.status === 'Admission Confirmed').length,
      };
    });
    res.json({ byCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

