import EligibilityRule from '../models/EligibilityRule.js';
import Branch from '../models/Branch.js';
import Course from '../models/Course.js';

function extractMetric(academic, field) {
  const quals = academic?.qualifications || [];
  const findQual = (lvl) => quals.find((q) => q.level?.toLowerCase() === lvl.toLowerCase());

  if (field === '10th_percentage') return findQual('10th')?.marks ?? null;
  if (field === '12th_percentage') return findQual('12th')?.marks ?? null;
  if (field === 'graduation_percentage') return findQual('Graduation')?.marks ?? null;
  if (field === 'entrance_score') return academic?.hasEntranceExam ? academic?.entranceExamScore ?? 0 : 0;
  if (field === 'subjects') {
    const allSubs = quals.map((q) => q.subjects || '').join(',').toLowerCase();
    return allSubs;
  }
  return null;
}

function evaluateCriterion(academic, criterion) {
  const actual = extractMetric(academic, criterion.field);
  const target = criterion.value;

  if (criterion.operator === 'includes') {
    const reqList = String(target)
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const actualStr = String(actual || '');
    const passed = reqList.every((sub) => actualStr.includes(sub));
    return {
      label: criterion.field.replace(/_/g, ' '),
      required: String(target),
      achieved: actual ? String(actual) : 'Not provided',
      passed,
    };
  }

  const numActual = Number(actual);
  const numTarget = Number(target);
  let passed = false;
  if (actual !== null && !isNaN(numActual)) {
    if (criterion.operator === 'gte') passed = numActual >= numTarget;
    else if (criterion.operator === 'gt') passed = numActual > numTarget;
    else if (criterion.operator === 'lte') passed = numActual <= numTarget;
    else if (criterion.operator === 'eq') passed = numActual === numTarget;
  }

  return {
    label: criterion.field.replace(/_/g, ' '),
    required: `${criterion.operator === 'gte' ? '≥' : criterion.operator} ${target}`,
    achieved: actual !== null ? `${actual}` : 'Not provided',
    passed,
  };
}

export async function checkBranchEligibility(academic, branch) {
  const rules = await EligibilityRule.find({
    courseId: branch.courseId,
    $or: [{ branchId: branch._id }, { branchId: null }],
    isActive: true,
  });

  const criteriaResults = [];

  if (rules.length > 0) {
    for (const rule of rules) {
      for (const c of rule.criteria) {
        criteriaResults.push(evaluateCriterion(academic, c));
      }
    }
  } else {
    // Fallback to branch's own minMarks & qualificationRequired
    const reqQual = branch.qualificationRequired || '12th';
    const qual = (academic?.qualifications || []).find(
      (q) => q.level?.toLowerCase() === reqQual.toLowerCase()
    );
    const marks = qual ? Number(qual.marks) : 0;
    criteriaResults.push({
      label: `${reqQual} Percentage`,
      required: `≥ ${branch.minMarks}%`,
      achieved: qual ? `${marks}%` : 'Not provided',
      passed: !!qual && marks >= (branch.minMarks || 0),
    });

    if (branch.requiredSubjects?.length > 0) {
      const subStr = (academic?.qualifications || []).map((q) => q.subjects || '').join(',').toLowerCase();
      const passed = branch.requiredSubjects.every((s) => subStr.includes(s.toLowerCase()));
      criteriaResults.push({
        label: 'Required Subjects',
        required: branch.requiredSubjects.join(', '),
        achieved: passed ? 'Present' : 'Missing',
        passed,
      });
    }
  }

  const isEligible = criteriaResults.length > 0 && criteriaResults.every((c) => c.passed);
  return { isEligible, criteria: criteriaResults };
}

export async function findAlternativeEligibleCourses(academic, excludedBranchId) {
  const activeBranches = await Branch.find({ isActive: true, _id: { $ne: excludedBranchId } }).populate('courseId');
  const alternatives = [];

  for (const branch of activeBranches) {
    if (!branch.courseId || !branch.courseId.isActive) continue;
    const { isEligible } = await checkBranchEligibility(academic, branch);
    if (isEligible) {
      alternatives.push({
        courseId: branch.courseId._id,
        branchId: branch._id,
        course: branch.courseId.name,
        branch: branch.name,
        reason: `Meets minimum ${branch.minMarks}% requirement`,
        fees: branch.fees?.total || 0,
      });
    }
  }
  return alternatives;
}

