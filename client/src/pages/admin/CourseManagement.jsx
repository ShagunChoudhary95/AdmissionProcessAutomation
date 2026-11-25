import { useState } from 'react';
import { Plus, Edit2, Power } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input } from '../../components/ui/Input';
import { sampleCourses } from '../../data/sampleData';
import toast from 'react-hot-toast';

export default function CourseManagement() {
  const [courses, setCourses] = useState(sampleCourses.map(c => ({ _id: c._id, name: c.name, isActive: c.isActive, branchCount: c.branches.length })));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const openAdd = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setName(c.name); setModalOpen(true); };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Course name is required.'); return; }
    if (editing) {
      setCourses(prev => prev.map(c => c._id === editing._id ? { ...c, name } : c));
      toast.success('Course updated.');
    } else {
      setCourses(prev => [...prev, { _id: Date.now().toString(), name, isActive: true, branchCount: 0 }]);
      toast.success('Course created.');
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setCourses(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
    toast.success('Status updated.');
  };

  const columns = [
    { header: 'Course Name', accessor: 'name', sortable: true },
    { header: 'Branches', accessor: 'branchCount', render: (r) => `${r.branchCount} branches` },
    { header: 'Status', accessor: 'isActive', render: (r) => <Badge color={r.isActive ? 'teal' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', key: 'action', render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(r)}>Edit</Button>
        <Button size="sm" variant={r.isActive ? 'danger' : 'success'} onClick={() => toggleActive(r._id)}>{r.isActive ? 'Deactivate' : 'Activate'}</Button>
      </div>
    )},
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Course Management</h2>
            <p className="text-sm text-slate-500">Manage degree programs offered by the institution.</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Course</Button>
        </div>
        <Card>
          <DataTable columns={columns} data={courses} searchable searchPlaceholder="Search courses..." />
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Add Course'} size="sm">
        <div className="p-6 space-y-4">
          <FormField label="Course Name" required>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. B.Tech" />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

