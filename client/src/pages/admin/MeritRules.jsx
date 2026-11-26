import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/Input';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function MeritRules() {
  const [rules, setRules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('All Branches');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [formula, setFormula] = useState([
    { component: '12th Marks', source: '12th_percentage', weight: 0.7 },
    { component: 'Entrance Exam', source: 'entrance_score', weight: 0.3 },
  ]);

  const loadRules = async () => {
    try {
      const [ruleRes, courseRes] = await Promise.all([
        adminService.getMeritRules(),
        adminService.getCourses(),
      ]);
      if (ruleRes.data?.rules) {
        setRules(ruleRes.data.rules.map(r => ({
          ...r,
          formula: r.formula || (r.formulaJson ? JSON.parse(r.formulaJson) : []),
        })));
      }
      if (courseRes.data?.courses) {
        setCourses(courseRes.data.courses);
        if (courseRes.data.courses.length > 0 && !course) {
          setCourse(courseRes.data.courses[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load merit rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const totalWeight = formula.reduce((s, f) => s + Number(f.weight || 0), 0);

  const handleSave = async () => {
    if (Math.abs(totalWeight - 1) > 0.01) {
      toast.error('Weights must sum to 1.0 (100%).');
      return;
    }

    try {
      const payload = {
        course,
        branch,
        description: description || formula.map((f) => `${Math.round(f.weight * 100)}% ${f.component}`).join(' + '),
        formulaJson: JSON.stringify(formula),
        isActive: true,
      };
      await adminService.createMeritRule(payload);
      toast.success('Merit formula saved in MySQL database.');
      setModalOpen(false);
      loadRules();
    } catch {
      toast.error('Failed to save merit rule.');
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Merit Rules</h2>
            <p className="text-sm text-slate-500">Define configurable merit score formulas for ranking applicants.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Merit Rule</Button>
        </div>

        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r._id}>
              <CardHeader className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CardTitle>{r.course} — {r.branch}</CardTitle>
                  <Badge color={r.isActive ? 'teal' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm text-slate-600">{r.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {r.formula.map((f, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">{f.component}</p>
                      <p className="text-base font-bold text-blue-700 mt-0.5">{Math.round(f.weight * 100)}% weight</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Configure Merit Formula" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course" required>
              <Select value={course} onChange={(e) => setCourse(e.target.value)}>
                {courses.map((c) => <option key={c.id || c._id} value={c.name}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Branch" required>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </FormField>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Formula Components (Sum = {totalWeight.toFixed(2)})</label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setFormula([...formula, { component: '10th Marks', source: '10th_percentage', weight: 0.1 }])}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Component
              </Button>
            </div>
            {formula.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={f.component}
                  onChange={(e) => {
                    const next = [...formula];
                    next[idx].component = e.target.value;
                    setFormula(next);
                  }}
                  placeholder="Label"
                />
                <Select
                  value={f.source}
                  onChange={(e) => {
                    const next = [...formula];
                    next[idx].source = e.target.value;
                    setFormula(next);
                  }}
                >
                  <option value="12th_percentage">12th Percentage</option>
                  <option value="10th_percentage">10th Percentage</option>
                  <option value="graduation_percentage">Graduation Percentage</option>
                  <option value="entrance_score">Entrance Score</option>
                </Select>
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  className="w-24"
                  value={f.weight}
                  onChange={(e) => {
                    const next = [...formula];
                    next[idx].weight = Number(e.target.value);
                    setFormula(next);
                  }}
                />
                {formula.length > 1 && (
                  <button type="button" onClick={() => setFormula(formula.filter((_, i) => i !== idx))} className="text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Formula</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

