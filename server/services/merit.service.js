import MeritRule from '../models/MeritRule.js';

function getSourceValue(academic, source) {
  const quals = academic?.qualifications || [];
  const findQual = (lvl) => quals.find((q) => q.level?.toLowerCase() === lvl.toLowerCase());

  if (source === '10th_percentage') return Number(findQual('10th')?.marks || 0);
  if (source === '12th_percentage') return Number(findQual('12th')?.marks || 0);
  if (source === 'graduation_percentage') return Number(findQual('Graduation')?.marks || 0);
  if (source === 'entrance_score') return academic?.hasEntranceExam ? Number(academic?.entranceExamScore || 0) : 0;
  return 0;
}

export async function calculateMerit(academic, branch) {
  let rule = await MeritRule.findOne({
    courseId: branch.courseId,
    branchId: branch._id,
    isActive: true,
  });

  if (!rule) {
    rule = await MeritRule.findOne({
      courseId: branch.courseId,
      branchId: null,
      isActive: true,
    });
  }

  if (!rule || !rule.formula?.length) {
    // Default fallback if admin hasn't configured a merit rule yet
    const qualMarks = getSourceValue(academic, `${(branch.qualificationRequired || '12th').toLowerCase()}_percentage`);
    return {
      meritScore: Number(qualMarks.toFixed(2)),
      meritBreakdown: [{ label: `${branch.qualificationRequired || '12th'} Marks (100%)`, score: Number(qualMarks.toFixed(2)) }],
    };
  }

  let totalScore = 0;
  const breakdown = [];
  for (const part of rule.formula) {
    const val = getSourceValue(academic, part.source);
    const weighted = Number((val * part.weight).toFixed(2));
    totalScore += weighted;
    breakdown.push({
      label: `${part.component} (${Math.round(part.weight * 100)}%)`,
      score: weighted,
    });
  }

  return {
    meritScore: Number(totalScore.toFixed(2)),
    meritBreakdown: breakdown,
  };
}

