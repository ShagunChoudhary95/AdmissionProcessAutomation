import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/Input';
import { sampleCourses } from '../../data/sampleData';
import toast from 'react-hot-toast';

const initialMeritRules = [
  {
    _id: 'mr1',
    course: 'B.Tech',
    branch: 'All Branches',
    description: '80% weightage to 12th Marks + 20% to 10th Marks',
    formula: [
      { component: '12th Marks', source: '12th_percentage', weight: 0.8 },
      { component: '10th Marks', source: '10th_percentage', weight: 0.2 },
    ],
    isActive: true,
  },
  {
    _id: 'mr2',
    course: 'M.Tech',
    branch: 'All Branches',
    description: '60% Entrance Score + 40% Graduation Marks',
    formula: [
      { component: 'Entrance Exam', source: 'entrance_score', weight: 0.6 },
      { component: 'Graduation Marks', source: 'graduation_percentage', weight: 0.4 },
    ],
    isActive: true,
  },
  {
    _id: 'mr3',
    course: 'MBA',
    branch: 'All Branches',
    description: '50% Entrance Exam + 30% Graduation + 20% 12th Marks',
    formula: [
      { component: 'Entrance Exam', source: 'entrance_score', weight: 0.5 },
      { component: 'Graduation Marks', source: 'graduation_percentage', weight: 0.3 },
      { component: '12th Marks', source: '12th_percentage', weight: 0.2 },
    ],
    isActive: true,
  },
];

export default function MeritRules() {
  const [rules, setRules] = useState(initialMeritRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('All Branches');
  const [description, setDescription] = useState('');
  const [formula, setFormula] = useState([
    { component: '12th Marks', source: '12th_percentage', weight: 0.7 },
    { component: 'Entrance Exam', source: 'entrance_score', weight: 0.3 },
  ]);

  const totalWeight = formula.reduce((s, f) => s + Number(f.weight || 0), 0);

  const handleSave = () => {
    if (Math.abs(totalWeight - 1) > 0.01) {
      toast.error('Weights must sum to 1.0 (100%).');
      return;
    }
    setRules((prev) => [
      ...prev,
      {
        _id: `mr_${Date.now()}`,
        course,
        branch,
        description: description || formula.map((f) => `${Math.round(f.weight * 100)}% ${f.component}`).join(' + '),
        formula,
        isActive: true,
      },
    ]);
    toast.success('Merit formula saved.');
    setModalOpen(false);
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
                {sampleCourses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
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

