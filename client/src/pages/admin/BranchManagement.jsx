import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/helpers';
import { sampleCourses } from '../../data/sampleData';
import toast from 'react-hot-toast';

const initialBranches = sampleCourses.flatMap((c) =>
  c.branches.map((b) => ({
    ...b,
    courseId: c._id,
    courseName: c.name,
  }))
);

export default function BranchManagement() {
  const [branches, setBranches] = useState(initialBranches);
  const [courseFilter, setCourseFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    courseId: sampleCourses[0]._id,
    name: '',
    minMarks: 50,
    totalSeats: 60,
    tuitionFee: 120000,
    registrationFee: 5000,
    qualificationRequired: '12th',
    requiredSubjects: '',
    entranceExamRequired: false,
    entranceExamName: '',
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      courseId: sampleCourses[0]._id,
      name: '',
      minMarks: 50,
      totalSeats: 60,
      tuitionFee: 120000,
      registrationFee: 5000,
      qualificationRequired: '12th',
      requiredSubjects: '',
      entranceExamRequired: false,
      entranceExamName: '',
    });
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      courseId: b.courseId,
      name: b.name,
      minMarks: b.minMarks || 50,
      totalSeats: b.totalSeats || 60,
      tuitionFee: (b.fees?.total || 100000) - 5000,
      registrationFee: 5000,
      qualificationRequired: b.qualificationRequired || '12th',
      requiredSubjects: b.requiredSubjects || '',
      entranceExamRequired: b.entranceExamRequired || false,
      entranceExamName: b.entranceExamName || '',
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Branch name is required.');
      return;
    }
    const courseName = sampleCourses.find((c) => c._id === form.courseId)?.name || 'B.Tech';
    const totalFee = Number(form.tuitionFee) + Number(form.registrationFee);

    if (editing) {
      setBranches((prev) =>
        prev.map((b) =>
          b._id === editing._id
            ? {
                ...b,
                ...form,
                courseName,
                minMarks: Number(form.minMarks),
                totalSeats: Number(form.totalSeats),
                fees: { tuition: Number(form.tuitionFee), registration: Number(form.registrationFee), total: totalFee },
              }
            : b
        )
      );
      toast.success('Branch updated.');
    } else {
      setBranches((prev) => [
        ...prev,
        {
          _id: `b_${Date.now()}`,
          courseId: form.courseId,
          courseName,
          name: form.name,
          minMarks: Number(form.minMarks),
          totalSeats: Number(form.totalSeats),
          confirmedSeats: 0,
          fees: { tuition: Number(form.tuitionFee), registration: Number(form.registrationFee), total: totalFee },
          qualificationRequired: form.qualificationRequired,
          requiredSubjects: form.requiredSubjects,
          entranceExamRequired: form.entranceExamRequired,
          entranceExamName: form.entranceExamName,
          isActive: true,
        },
      ]);
      toast.success('Branch created.');
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setBranches((prev) => prev.map((b) => (b._id === id ? { ...b, isActive: !b.isActive } : b)));
    toast.success('Branch status updated.');
  };

  const filtered = branches.filter((b) => courseFilter === 'All' || b.courseName === courseFilter);

  const columns = [
    { header: 'Course', accessor: 'courseName', sortable: true },
    { header: 'Branch', accessor: 'name', sortable: true },
    { header: 'Min. Marks', accessor: 'minMarks', render: (r) => `${r.minMarks}%` },
    { header: 'Seats', accessor: 'totalSeats', render: (r) => `${r.confirmedSeats || 0} / ${r.totalSeats}` },
    { header: 'Annual Fee', key: 'fees', render: (r) => formatCurrency(r.fees?.total) },
    { header: 'Status', accessor: 'isActive', render: (r) => <Badge color={r.isActive ? 'teal' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      header: 'Actions',
      key: 'action',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button size="sm" variant={r.isActive ? 'danger' : 'success'} onClick={() => toggleActive(r._id)}>
            {r.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Branch Management</h2>
            <p className="text-sm text-slate-500">Configure branches, fee structures, seat capacities, and minimum requirements.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-36">
              <option value="All">All Courses</option>
              {sampleCourses.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </Select>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Branch</Button>
          </div>
        </div>

        <Card>
          <DataTable columns={columns} data={filtered} searchable searchPlaceholder="Search branches..." />
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'} size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Course" required>
              <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                {sampleCourses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Branch Name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
            </FormField>
            <FormField label="Qualification Required" required>
              <Select value={form.qualificationRequired} onChange={(e) => setForm({ ...form, qualificationRequired: e.target.value })}>
                <option>10th</option>
                <option>12th</option>
                <option>Graduation</option>
              </Select>
            </FormField>
            <FormField label="Minimum Marks (%)" required>
              <Input type="number" value={form.minMarks} onChange={(e) => setForm({ ...form, minMarks: e.target.value })} />
            </FormField>
            <FormField label="Seat Capacity" required>
              <Input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
            </FormField>
            <FormField label="Required Subjects (comma-separated)">
              <Input value={form.requiredSubjects} onChange={(e) => setForm({ ...form, requiredSubjects: e.target.value })} placeholder="Physics, Chemistry, Math" />
            </FormField>
            <FormField label="Tuition Fee (INR)" required>
              <Input type="number" value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })} />
            </FormField>
            <FormField label="Registration Fee (INR)" required>
              <Input type="number" value={form.registrationFee} onChange={(e) => setForm({ ...form, registrationFee: e.target.value })} />
            </FormField>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="entranceReq"
              checked={form.entranceExamRequired}
              onChange={(e) => setForm({ ...form, entranceExamRequired: e.target.checked })}
              className="w-4 h-4 text-blue-700 rounded border-slate-300"
            />
            <label htmlFor="entranceReq" className="text-sm text-slate-700">Entrance exam required</label>
          </div>
          {form.entranceExamRequired && (
            <FormField label="Entrance Exam Name">
              <Input value={form.entranceExamName} onChange={(e) => setForm({ ...form, entranceExamName: e.target.value })} placeholder="e.g. JEE Main, GATE, CAT" />
            </FormField>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Branch</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

