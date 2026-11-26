import { useState, useEffect } from 'react';
import { Plus, Edit2, Power } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input } from '../../components/ui/Input';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      const res = await adminService.getCourses();
      if (res.data?.courses) {
        setCourses(res.data.courses.map(c => ({
          _id: c._id || String(c.id),
          id: c.id,
          name: c.name,
          isActive: c.isActive,
          branchCount: c.branchCount || (c.branches ? c.branches.length : 0),
        })));
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openAdd = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setName(c.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Course name is required.'); return; }
    try {
      if (editing) {
        await adminService.updateCourse(editing.id || editing._id, { name, isActive: editing.isActive });
        toast.success('Course updated successfully.');
      } else {
        await adminService.createCourse({ name, isActive: true });
        toast.success('Course created successfully.');
      }
      setModalOpen(false);
      loadCourses();
    } catch {
      toast.error('Failed to save course.');
    }
  };

  const toggleActive = async (row) => {
    try {
      await adminService.updateCourse(row.id || row._id, { name: row.name, isActive: !row.isActive });
      toast.success('Status updated successfully.');
      loadCourses();
    } catch {
      toast.error('Failed to toggle status.');
    }
  };

  const columns = [
    { header: 'Course Name', accessor: 'name', sortable: true },
    { header: 'Branches', accessor: 'branchCount', render: (r) => `${r.branchCount} branches` },
    { header: 'Status', accessor: 'isActive', render: (r) => <Badge color={r.isActive ? 'teal' : 'gray'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Actions', key: 'action', render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(r)}>Edit</Button>
        <Button size="sm" variant={r.isActive ? 'danger' : 'success'} onClick={() => toggleActive(r)}>{r.isActive ? 'Deactivate' : 'Activate'}</Button>
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

