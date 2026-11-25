import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Users, BookOpen, IndianRupee, Info } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';
import { courseService, applicationService } from '../../services';
import { sampleCourses } from '../../data/sampleData';
import toast from 'react-hot-toast';

export default function CourseSelection() {
  const [courses, setCourses] = useState(sampleCourses);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState('B.Tech');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    courseService.list().then((res) => {
      if (res.data.courses?.length) {
        setCourses(res.data.courses);
        setExpandedCourse(res.data.courses[0].name);
      }
    }).catch(() => {});
  }, []);

  const handleSelect = (course, branch) => {
    setSelectedCourse(course);
    setSelectedBranch(branch);
  };

  const handleProceed = async () => {
    if (!selectedCourse || !selectedBranch) {
      toast.error('Please select a course and branch.');
      return;
    }
    setSaving(true);
    try {
      const draftRes = await applicationService.create();
      const appId = draftRes.data.application._id;
      await applicationService.updateCourse(appId, {
        courseId: selectedCourse._id,
        branchId: selectedBranch._id,
      });
      toast.success(`Course selected: ${selectedCourse.name} — ${selectedBranch.name}`);
      navigate('/student/eligibility');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save course selection.');
    } finally {
      setSaving(false);
    }
  };

  const availableSeats = (branch) => Math.max(0, branch.totalSeats - (branch.confirmedSeats || 0) - (branch.reservedSeats || 0));

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Select Course & Branch</h2>
          <p className="text-sm text-slate-500">Choose the course and branch you wish to apply for. Eligibility will be checked after selection.</p>
        </div>

        {selectedBranch && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 flex-1">
              Selected: <span className="font-semibold">{selectedCourse?.name} — {selectedBranch.name}</span>
            </p>
            <Button size="sm" loading={saving} onClick={handleProceed}>Check Eligibility →</Button>
          </div>
        )}

        {courses.map((course) => (
          <Card key={course._id}>
            <button
              className="w-full text-left"
              onClick={() => setExpandedCourse(expandedCourse === course.name ? null : course.name)}
            >
              <CardHeader className="flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <CardTitle>{course.name}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{(course.branches || []).filter(b => b.isActive).length} branches available</p>
                  </div>
                </div>
                {expandedCourse === course.name ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </CardHeader>
            </button>

            {expandedCourse === course.name && (
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100">
                  {(course.branches || []).filter(b => b.isActive).map((branch) => {
                    const isSelected = selectedBranch?._id === branch._id;
                    const seats = availableSeats(branch);
                    const seatColor = seats > 10 ? 'green' : seats > 0 ? 'amber' : 'red';

                    return (
                      <div
                        key={branch._id}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-700' : ''}`}
                        onClick={() => handleSelect(course, branch)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{branch.name}</p>
                            {isSelected && <Badge color="blue">Selected</Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" /> {formatCurrency(branch.fees?.total)} / year
                            </span>
                            <span>Min. {branch.minMarks}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Available Seats</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-slate-400" />
                              <Badge color={seatColor}>{seats} / {branch.totalSeats}</Badge>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-700 bg-blue-700' : 'border-slate-300'}`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            )}
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleProceed} loading={saving} disabled={!selectedBranch} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Check Eligibility
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
