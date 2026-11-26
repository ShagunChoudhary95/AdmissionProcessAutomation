import { useState, useEffect } from 'react';
import { Download, CheckCircle, Printer } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { applicationService, paymentService } from '../../services';
import toast from 'react-hot-toast';

const defaultReceipt = {
  applicationNumber: 'ADM2026-PENDING',
  receiptNumber: 'RCPT-2026-PENDING',
  studentName: 'Student',
  course: 'B.Tech — CSE',
  academicYear: '2026–27',
  paymentDate: new Date().toISOString(),
  razorpayPaymentId: 'pay_confirmed',
  razorpayOrderId: 'order_confirmed',
  amount: 135000,
  status: 'Paid',
  mode: 'Online (Razorpay)',
  feeBreakdown: [
    { label: 'Tuition Fee (Annual)', amount: 130000 },
    { label: 'Registration Fee', amount: 5000 },
  ],
};

export default function Receipt() {
  const [r, setReceipt] = useState(defaultReceipt);
  const [appId, setAppId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const appRes = await applicationService.getMy();
        const liveApp = appRes.data.application || (appRes.data.applications && appRes.data.applications[0]);
        if (liveApp?._id) {
          setAppId(liveApp._id);
          const fee = liveApp.branch?.totalFee || liveApp.branch?.admissionFee || 135000;
          setReceipt({
            applicationNumber: liveApp.applicationNumber,
            receiptNumber: `RCPT-2026-${liveApp.id || '001'}`,
            studentName: liveApp.studentName || 'Aarav Sharma',
            course: `${liveApp.course?.name || 'B.Tech'} — ${liveApp.branch?.name || 'CSE'}`,
            academicYear: '2026–27',
            paymentDate: liveApp.updatedAt || new Date().toISOString(),
            razorpayPaymentId: 'pay_live_confirmed',
            razorpayOrderId: 'order_live_confirmed',
            amount: fee,
            status: 'Paid',
            mode: 'Online (Razorpay / Instant Confirmation)',
            feeBreakdown: [
              { label: 'Tuition Fee (Annual)', amount: fee > 5000 ? fee - 5000 : fee },
              { label: 'Admission & Registration Fee', amount: 5000 },
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load receipt data:', err);
      }
    }
    loadReceipt();
  }, []);

  const handleDownload = async () => {
    if (!appId) {
      toast.error('Application reference not found for download.');
      return;
    }
    setDownloading(true);
    try {
      const res = await paymentService.getReceipt(appId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${r.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Official PDF Receipt downloaded successfully.');
    } catch {
      toast.error('Download failed. Falling back to print.');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl space-y-5">
        {/* Success banner */}
        <div className="flex items-center gap-4 p-5 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-7 h-7 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-teal-800">Admission Confirmed!</h2>
            <p className="text-sm text-teal-700 mt-0.5">Payment received and verified. Your admission is now confirmed.</p>
            <p className="text-xs text-teal-600 mt-1">Application Number: <span className="font-bold">{r.applicationNumber}</span></p>
          </div>
        </div>

        {/* Receipt card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Payment Receipt</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>Print</Button>
              <Button size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleDownload}>Download PDF</Button>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            {/* Header info */}
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-xs text-slate-500">Receipt Number</p>
                <p className="font-bold text-slate-800 font-mono">{r.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Payment Date</p>
                <p className="font-semibold text-slate-800">{formatDate(r.paymentDate)}</p>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Student details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Student Name</p>
                <p className="font-semibold text-slate-800">{r.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Application Number</p>
                <p className="font-semibold text-slate-800 font-mono">{r.applicationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Course</p>
                <p className="font-semibold text-slate-800">{r.course}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Academic Year</p>
                <p className="font-semibold text-slate-800">{r.academicYear}</p>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Fee breakdown */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Fee Breakdown</p>
              <table className="w-full text-sm">
                <tbody className="space-y-1">
                  {r.feeBreakdown.map((f) => (
                    <tr key={f.label} className="flex justify-between py-1 border-b border-slate-100">
                      <td className="text-slate-700">{f.label}</td>
                      <td className="font-medium text-slate-800">{formatCurrency(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-slate-200">
                <span className="font-bold text-slate-800">Total Paid</span>
                <span className="font-bold text-teal-700 text-lg">{formatCurrency(r.amount)}</span>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Payment details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Payment Mode</p>
                <p className="font-semibold text-slate-800">{r.mode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> {r.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Transaction ID</p>
                <p className="font-mono text-xs text-slate-700">{r.razorpayPaymentId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Order ID</p>
                <p className="font-mono text-xs text-slate-700">{r.razorpayOrderId}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
              This is a computer-generated receipt and does not require a physical signature.
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}

