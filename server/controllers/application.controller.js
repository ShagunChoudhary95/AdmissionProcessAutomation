import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import Branch from '../models/Branch.js';
import Document from '../models/Document.js';
import { generateUniqueApplicationNumber } from '../services/applicationNumber.service.js';
import { checkBranchEligibility, findAlternativeEligibleCourses } from '../services/eligibility.service.js';
import { calculateMerit } from '../services/merit.service.js';
import { canTransition } from '../utils/statusTransitions.js';
import { notifyUser } from '../services/email.service.js';

export async function createOrGetDraft(req, res) {
  try {
    let app = await Application.findOne({ studentId: req.user._id, status: { $ne: 'Withdrawn' } })
      .populate('courseId', 'name')
      .populate('branchId', 'name fees minMarks totalSeats confirmedSeats reservedSeats requiredDocuments');

    if (!app) {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      const applicationNumber = await generateUniqueApplicationNumber();
      app = await Application.create({
        applicationNumber,
        studentId: req.user._id,
        personalDetails: profile?.personal || {},
        academicDetails: profile?.academic || {},
        status: 'Draft',
        statusHistory: [{ status: 'Draft', actor: req.user.name, actorId: req.user._id, note: 'Draft created' }],
      });
    }

    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMyApplication(req, res) {
  try {
    const app = await Application.findOne({ studentId: req.user._id, status: { $ne: 'Withdrawn' } })
      .populate('courseId', 'name')
      .populate('branchId', 'name fees minMarks totalSeats confirmedSeats reservedSeats requiredDocuments');
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const { courseId, branchId } = req.body;
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (!['Draft', 'Not Eligible', 'Correction Required'].includes(app.status)) {
      return res.status(400).json({ message: 'Course cannot be changed in current status' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch || !branch.isActive) {
      return res.status(404).json({ message: 'Selected branch is not available' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const academic = profile?.academic || app.academicDetails;

    app.courseId = courseId || branch.courseId;
    app.branchId = branch._id;
    app.personalDetails = profile?.personal || app.personalDetails;
    app.academicDetails = academic;

    // Run eligibility & merit immediately
    const elig = await checkBranchEligibility(academic, branch);
    let alternatives = [];
    let meritScore = null;
    let meritBreakdown = [];

    if (elig.isEligible) {
      const merit = await calculateMerit(academic, branch);
      meritScore = merit.meritScore;
      meritBreakdown = merit.meritBreakdown;
    } else {
      alternatives = await findAlternativeEligibleCourses(academic, branch._id);
    }

    app.eligibilityResult = {
      isEligible: elig.isEligible,
      criteria: elig.criteria,
      alternativeCourses: alternatives,
      checkedAt: new Date(),
    };
    app.meritScore = meritScore;
    app.meritBreakdown = meritBreakdown;
    if (app.status === 'Not Eligible') {
      app.status = 'Draft';
    }

    await app.save();
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function checkEligibility(req, res) {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user._id }).populate('branchId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (!app.branchId) return res.status(400).json({ message: 'Please select a course and branch first' });

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    const academic = profile?.academic || app.academicDetails;
    const elig = await checkBranchEligibility(academic, app.branchId);
    const alternatives = elig.isEligible ? [] : await findAlternativeEligibleCourses(academic, app.branchId._id);

    let merit = { meritScore: null, meritBreakdown: [] };
    if (elig.isEligible) {
      merit = await calculateMerit(academic, app.branchId);
    }

    app.eligibilityResult = {
      isEligible: elig.isEligible,
      criteria: elig.criteria,
      alternativeCourses: alternatives,
      checkedAt: new Date(),
    };
    app.meritScore = merit.meritScore;
    app.meritBreakdown = merit.meritBreakdown;
    await app.save();

    res.json({
      eligibilityResult: app.eligibilityResult,
      meritScore: app.meritScore,
      meritBreakdown: app.meritBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function submitApplication(req, res) {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user._id }).populate('branchId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (!canTransition(app.status, 'Submitted')) {
      return res.status(400).json({ message: `Cannot submit from status ${app.status}` });
    }
    if (!app.branchId) {
      return res.status(400).json({ message: 'Please select a course and branch before submitting.' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    app.personalDetails = profile?.personal || app.personalDetails;
    app.academicDetails = profile?.academic || app.academicDetails;

    app.status = 'Submitted';
    app.submittedAt = new Date();
    app.statusHistory.push({
      status: 'Submitted',
      actor: req.user.name,
      actorId: req.user._id,
      note: 'Application submitted by student',
    });

    // Move to Under Admin Review
    app.status = 'Under Admin Review';
    app.statusHistory.push({
      status: 'Under Admin Review',
      actor: 'System',
      note: 'Application queued for admin review',
    });

    await app.save();

    // Seed required document placeholders for the branch
    const reqDocs = app.branchId.requiredDocuments || [];
    for (const d of reqDocs) {
      await Document.findOneAndUpdate(
        { applicationId: app._id, documentType: d.name },
        {
          $setOnInsert: {
            applicationId: app._id,
            studentId: req.user._id,
            documentType: d.name,
            requiredForCourse: d.required,
            currentVersion: { verificationStatus: 'Not Uploaded' },
          },
        },
        { upsert: true }
      );
    }

    await notifyUser({
      userId: req.user._id,
      email: req.user.email,
      title: 'Application Submitted',
      message: `Your application ${app.applicationNumber} has been submitted successfully and is now under admin review.`,
      type: 'success',
      relatedEntity: { type: 'Application', id: app._id },
    });

    res.json({ application: app, message: 'Application submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function submitCorrection(req, res) {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status !== 'Correction Required') {
      return res.status(400).json({ message: 'Application is not in Correction Required state' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });
    app.personalDetails = profile?.personal || app.personalDetails;
    app.academicDetails = profile?.academic || app.academicDetails;
    app.status = 'Submitted';
    app.statusHistory.push({
      status: 'Submitted',
      actor: req.user.name,
      actorId: req.user._id,
      note: 'Corrections submitted by student',
    });
    app.status = 'Under Admin Review';
    app.statusHistory.push({
      status: 'Under Admin Review',
      actor: 'System',
      note: 'Returned to admin review after correction',
    });

    await app.save();
    res.json({ application: app, message: 'Corrections submitted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getApplicationStatus(req, res) {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user._id })
      .select('applicationNumber status statusHistory correctionRemarks adminRemarks meritScore meritRank');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json({ status: app.status, applicationNumber: app.applicationNumber, statusHistory: app.statusHistory, app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

