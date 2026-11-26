import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input } from '../../components/ui/Input';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function SeatManagement() {
  const [seats, setSeats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [totalSeats, setTotalSeats] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSeats = async () => {
    try {
      const res = await adminService.getSeats();
      if (res.data?.seats) {
        setSeats(res.data.seats.map(s => ({
          ...s,
          course: s.courseName,
          branch: s.branchName,
          total: s.totalSeats,
          reserved: s.reservedSeats || 0,
          confirmed: s.filledSeats || 0,
          available: s.availableSeats,
        })));
      }
    } catch (err) {
      console.error('Failed to load seats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
  }, []);

  const openEdit = (row) => {
    setEditing(row);
    setTotalSeats(String(row.total));
  };

  const handleSave = async () => {
    const num = Number(totalSeats);
    if (isNaN(num) || num < (editing.confirmed || 0) + (editing.reserved || 0)) {
      toast.error(`Seat capacity cannot be less than occupied seats (${(editing.confirmed || 0) + (editing.reserved || 0)}).`);
      return;
    }
    try {
      await adminService.updateSeats(editing.branchId || editing.id, { totalSeats: num });
      toast.success('Seat capacity updated in database.');
      setEditing(null);
      loadSeats();
    } catch {
      toast.error('Failed to update seat capacity.');
    }
  };

  const columns = [
    { header: 'Course', accessor: 'course', sortable: true },
    { header: 'Branch', accessor: 'branch', sortable: true },
    { header: 'Total Capacity', accessor: 'total', sortable: true },
    { header: 'Reserved', accessor: 'reserved', render: (r) => <Badge color="amber">{r.reserved}</Badge> },
    { header: 'Confirmed', accessor: 'confirmed', render: (r) => <Badge color="teal">{r.confirmed}</Badge> },
    {
      header: 'Available',
      accessor: 'available',
      render: (r) => (
        <Badge color={r.available > 15 ? 'green' : r.available > 0 ? 'amber' : 'red'}>
          {r.available}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'action',
      render: (r) => (
        <Button size="sm" variant="secondary" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(r)}>
          Update Capacity
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Seat Management</h2>
          <p className="text-sm text-slate-500">Monitor seat reservations, confirmed admissions, and adjust branch capacities.</p>
        </div>

        <Card>
          <DataTable columns={columns} data={seats} searchable searchPlaceholder="Search by course or branch..." />
        </Card>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Update Capacity — ${editing?.branch}`} size="sm">
        <div className="p-6 space-y-4">
          <FormField label="Total Seat Capacity" required hint={`Minimum allowed: ${(editing?.confirmed || 0) + (editing?.reserved || 0)} (currently occupied)`}>
            <Input type="number" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

