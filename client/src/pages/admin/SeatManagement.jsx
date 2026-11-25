import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FormField, Input } from '../../components/ui/Input';
import { sampleSeatData } from '../../data/sampleData';
import toast from 'react-hot-toast';

export default function SeatManagement() {
  const [seats, setSeats] = useState(sampleSeatData.map((s, i) => ({ ...s, _id: `s_${i}` })));
  const [editing, setEditing] = useState(null);
  const [totalSeats, setTotalSeats] = useState('');

  const openEdit = (row) => {
    setEditing(row);
    setTotalSeats(String(row.total));
  };

  const handleSave = () => {
    const num = Number(totalSeats);
    if (isNaN(num) || num < editing.confirmed + editing.reserved) {
      toast.error(`Seat capacity cannot be less than occupied seats (${editing.confirmed + editing.reserved}).`);
      return;
    }
    setSeats((prev) =>
      prev.map((s) =>
        s._id === editing._id
          ? { ...s, total: num, available: num - s.confirmed - s.reserved }
          : s
      )
    );
    toast.success('Seat capacity updated.');
    setEditing(null);
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

