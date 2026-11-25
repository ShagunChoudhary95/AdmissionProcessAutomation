import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/Input';
import { sampleCourses } from '../../data/sampleData';
import toast from 'react-hot-toast';

const initialRules = [
  {
    _id: 'er1',
    course: 'B.Tech',
    branch: 'Computer Science',
    description: '12th with Physics & Mathematics, minimum 60% aggregate',
    criteria: [
      { field: '12th_percentage', operator: 'gte', value: '60' },
      { field: 'subjects', operator: 'includes', value: 'Physics, Mathematics' },
    ],
    isActive: true,
  },
  {
    _id: 'er2',
    course: 'B.Tech',
    branch: 'AI & Data Science',
    description: '12th with PCM, minimum 65% aggregate',
    criteria: [
      { field: '12th_percentage', operator: 'gte', value: '65' },
      { field: 'subjects', operator: 'includes', value: 'Physics, Mathematics' },
    ],
    isActive: true,
  },
  {
    _id: 'er3',
    course: 'M.Tech',
    branch: 'AI/ML',
    description: 'Graduation in CS/IT with minimum 60% and valid GATE score',
    criteria: [
      { field: 'graduation_percentage', operator: 'gte', value: '60' },
      { field: 'entrance_score', operator: 'gte', value: '30' },
    ],
    isActive: true,
  },
  {
    _id: 'er4',
    course: 'MBA',
    branch: 'Finance',
    description: 'Graduation in any discipline with minimum 50%',
    criteria: [{ field: 'graduation_percentage', operator: 'gte', value: '50' }],
    isActive: true,
  },
];

export default function EligibilityRules() {
  const [rules, setRules] = useState(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState([{ field: '12th_percentage', operator: 'gte', value: '60' }]);

  const addCriterion = () => setCriteria([...criteria, { field: '10th_percentage', operator: 'gte', value: '50' }]);
  const removeCriterion = (idx) => setCriteria(criteria.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!description.trim()) {
      toast.error('Please enter a rule description.');
      return;
    }
    setRules((prev) => [
      ...prev,
      {
        _id: `er_${Date.now()}`,
        course,
        branch,
        description,
        criteria,
        isActive: true,
      },
    ]);
    toast.success('Eligibility rule saved.');
    setModalOpen(false);
    setDescription('');
  };

  const toggleRule = (id) => {
    setRules((prev) => prev.map((r) => (r._id === id ? { ...r, isActive: !r.isActive } : r)));
    toast.success('Rule status updated.');
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Eligibility Rules</h2>
            <p className="text-sm text-slate-500">Configure automated eligibility criteria per course and branch.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Rule</Button>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule._id}>
              <CardHeader className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CardTitle>{rule.course} — {rule.branch}</CardTitle>
                  <Badge color={rule.isActive ? 'teal' : 'gray'}>{rule.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <Button size="sm" variant={rule.isActive ? 'secondary' : 'success'} onClick={() => toggleRule(rule._id)}>
                  {rule.isActive ? 'Disable' : 'Enable'}
                </Button>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm text-slate-600">{rule.description}</p>
                <div className="flex flex-wrap gap-2">
                  {rule.criteria.map((c, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-mono">
                      {c.field} {c.operator} {c.value}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Configure Eligibility Rule" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course" required>
              <Select value={course} onChange={(e) => setCourse(e.target.value)}>
                {sampleCourses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Branch" required>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch name" />
            </FormField>
          </div>
          <FormField label="Rule Description" required>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 12th with PCM >= 60%" />
          </FormField>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Criteria Conditions</label>
              <Button type="button" size="sm" variant="secondary" onClick={addCriterion} leftIcon={<Plus className="w-3 h-3" />}>Add Condition</Button>
            </div>
            {criteria.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  value={c.field}
                  onChange={(e) => {
                    const next = [...criteria];
                    next[idx].field = e.target.value;
                    setCriteria(next);
                  }}
                >
                  <option value="10th_percentage">10th Percentage</option>
                  <option value="12th_percentage">12th Percentage</option>
                  <option value="graduation_percentage">Graduation Percentage</option>
                  <option value="entrance_score">Entrance Score</option>
                  <option value="subjects">Required Subjects</option>
                </Select>
                <Select
                  value={c.operator}
                  onChange={(e) => {
                    const next = [...criteria];
                    next[idx].operator = e.target.value;
                    setCriteria(next);
                  }}
                  className="w-32"
                >
                  <option value="gte">&gt;=</option>
                  <option value="gt">&gt;</option>
                  <option value="eq">=</option>
                  <option value="includes">includes</option>
                </Select>
                <Input
                  value={c.value}
                  onChange={(e) => {
                    const next = [...criteria];
                    next[idx].value = e.target.value;
                    setCriteria(next);
                  }}
                  placeholder="Value"
                />
                {criteria.length > 1 && (
                  <button type="button" onClick={() => removeCriterion(idx)} className="text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Rule</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

