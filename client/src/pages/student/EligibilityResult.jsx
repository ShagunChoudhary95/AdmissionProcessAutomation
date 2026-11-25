import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Simulated eligibility result (from backend in Phase 5)
const eligibilityResult = {
  isEligible: true,
  selectedCourse: 'B.Tech',
  selectedBranch: 'Computer Science',
  meritScore: 87.5,
  meritRank: 12,
  criteria: [
    { label: '12th Percentage', required: '≥ 60%', achieved: '85.5%', passed: true },
    { label: 'Physics & Mathematics', required: 'Must have studied', achieved: 'Yes', passed: true },
    { label: 'JEE Main Score', required: 'Not required', achieved: 'N/A', passed: true },
  ],
  meritComponents: [
    { label: '12th Marks (80% weight)', value: 85.5, weightedScore: 68.4 },
    { label: 'Academic Record (20% weight)', value: 95.5, weightedScore: 19.1 },
  ],
  alternativeCourses: [],
};

// Simulated ineligible result
const ineligibleResult = {
  isEligible: false,
  selectedCourse: 'B.Tech',
  selectedBranch: 'AI & Data Science',
  meritScore: null,
  meritRank: null,
  criteria: [
    { label: '12th Percentage', required: '≥ 65%', achieved: '58%', passed: false },
    { label: 'Physics & Mathematics', required: 'Must have studied', achieved: 'Yes', passed: true },
  ],
  meritComponents: [],
  alternativeCourses: [
    { courseId: 'c5', course: 'BCA', branch: 'General Computer Applications', reason: 'Your 12th marks meet the minimum 45% requirement', fees: 90000 },
    { courseId: 'c4', course: 'MCA', branch: 'General', reason: 'Graduation requirement waived for direct entry BCA equivalent', fees: 100000 },
  ],
};

export default function EligibilityResult() {
  const [result] = useState(eligibilityResult); // swap to ineligibleResult to test
  const [chosenAlternative, setChosenAlternative] = useState(null);
  const navigate = useNavigate();

  const handleAlternativeSelect = (alt) => {
    setChosenAlternative(alt);
  };

  const handleProceed = () => {
    if (!result.isEligible && !chosenAlternative) {
      toast.error('Please select an alternative course to proceed.');
      return;
    }
    toast.success('Proceeding to application review...');
    navigate('/student/application');
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl space-y-5">
        {/* Result banner */}
        <Card className={result.isEligible ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'}>
          <CardBody className="flex items-start gap-4">
            {result.isEligible
              ? <CheckCircle className="w-8 h-8 text-teal-600 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <h2 className={`text-base font-bold ${result.isEligible ? 'text-teal-800' : 'text-red-800'}`}>
                {result.isEligible ? 'You are eligible!' : 'Not eligible for selected course'}
              </h2>
              <p className="text-sm mt-1 text-slate-700">
                Course: <span className="font-semibold">{result.selectedCourse} — {result.selectedBranch}</span>
              </p>
              {result.isEligible && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-sm">
                    <span className="text-slate-500">Merit Score: </span>
                    <span className="font-bold text-teal-700">{result.meritScore} / 100</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Merit Rank: </span>
                    <span className="font-bold text-teal-700">#{result.meritRank}</span>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Eligibility criteria */}
        <Card>
          <CardHeader><CardTitle>Eligibility Criteria Check</CardTitle></CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Criteria</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Required</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Your Score</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.criteria.map((c, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-slate-700">{c.label}</td>
                    <td className="px-5 py-3 text-slate-600">{c.required}</td>
                    <td className="px-5 py-3 text-slate-600">{c.achieved}</td>
                    <td className="px-5 py-3">
                      {c.passed
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700"><CheckCircle className="w-3.5 h-3.5" /> Pass</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><XCircle className="w-3.5 h-3.5" /> Fail</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Merit breakdown (if eligible) */}
        {result.isEligible && result.meritComponents.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Merit Score Breakdown</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {result.meritComponents.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{m.label}</span>
                    <span className="font-semibold text-slate-800">{m.weightedScore.toFixed(2)} pts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(m.weightedScore / result.meritScore) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Merit Score</span>
                <span className="text-sm font-bold text-blue-700">{result.meritScore} / 100</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Alternative courses (if ineligible) */}
        {!result.isEligible && result.alternativeCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alternative Eligible Courses</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">You may choose one of these courses instead. The choice is yours — your original selection will not be changed automatically.</p>
            </CardHeader>
            <CardBody className="space-y-3">
              {result.alternativeCourses.map((alt, i) => (
                <div
                  key={i}
                  onClick={() => handleAlternativeSelect(alt)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${chosenAlternative?.course === alt.course && chosenAlternative?.branch === alt.branch ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{alt.course} — {alt.branch}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{alt.reason}</p>
                      <p className="text-xs font-medium text-slate-700 mt-1">{formatCurrency(alt.fees)} / year</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${chosenAlternative?.course === alt.course ? 'border-blue-700 bg-blue-700' : 'border-slate-300'}`}>
                      {chosenAlternative?.course === alt.course && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Not eligible, no alternatives */}
        {!result.isEligible && result.alternativeCourses.length === 0 && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">No alternative courses available</p>
              <p className="text-sm text-red-700 mt-0.5">Unfortunately, your academic profile does not meet the eligibility criteria for any available course. You may go back and check your academic details or contact the admissions office.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/student/courses')}>← Change Course</Button>
          {(result.isEligible || chosenAlternative) && (
            <Button onClick={handleProceed} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Proceed to Application
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

