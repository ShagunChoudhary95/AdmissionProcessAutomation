import { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input, Select } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/helpers';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    courseId: '1',
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

  const loadData = async () => {
    try {
      const [branchRes, courseRes] = await Promise.all([
        adminService.getBranches(),
        adminService.getCourses(),
      ]);
      if (branchRes.data?.branches) {
        setBranches(branchRes.data.branches);
      }
      if (courseRes.data?.courses) {
        setCourses(courseRes.data.courses);
        if (courseRes.data.courses.length > 0) {
          setForm(f => ({ ...f, courseId: String(courseRes.data.courses[0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      courseId: courses[0]?.id ? String(courses[0].id) : '1',
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
      courseId: String(b.courseId || b.course?.id || '1'),
      name: b.name,
      minMarks: b.minMarks || 50,
      totalSeats: b.totalSeats || b.intake || 60,
      tuitionFee: b.fees?.tuition || b.tuitionFee || 120000,
      registrationFee: b.fees?.registration || b.registrationFee || 5000,
      qualificationRequired: b.qualificationRequired || '12th',
      requiredSubjects: b.requiredSubjects || '',
      entranceExamRequired: !!b.entranceExamRequired,
      entranceExamName: b.entranceExamName || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Branch name is required.');
      return;
    }

    try {
      const payload = {
        courseId: form.courseId,
        name: form.name,
        totalSeats: Number(form.totalSeats),
        tuitionFee: Number(form.tuitionFee),
        registrationFee: Number(form.registrationFee),
        minMarks: Number(form.minMarks),
        qualificationRequired: form.qualificationRequired,
        requiredSubjects: form.requiredSubjects,
        entranceExamRequired: form.entranceExamRequired,
        entranceExamName: form.entranceExamName,
      };

      if (editing) {
        await adminService.updateBranch(editing.id || editing._id, payload);
        toast.success('Branch updated successfully.');
      } else {
        await adminService.createBranch(payload);
        toast.success('Branch created successfully.');
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save branch.');
    }
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
              {courses.map((c) => (
                <option key={c.id || c._id} value={c.name}>{c.name}</option>
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
                {courses.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
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

