import { useState } from 'react';
import { Shield, CreditCard, IndianRupee, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const feeBreakdown = [
  { label: 'Tuition Fee', amount: 120000 },
  { label: 'Registration Fee', amount: 5000 },
  { label: 'Library & Lab Fee', amount: 15000 },
  { label: 'Development Fee', amount: 10000 },
];
const total = feeBreakdown.reduce((s, f) => s + f.amount, 0);

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      // const orderRes = await paymentService.createOrder(applicationId);
      // const { orderId, amount, currency, key } = orderRes.data;
      // 2. Open Razorpay checkout
      // const rzp = new window.Razorpay({ key, amount, currency, order_id: orderId, ... });
      // rzp.open();
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Payment successful! Generating receipt...');
      navigate('/student/receipt');
    } catch {
      toast.error('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Fee Payment</h2>
          <p className="text-sm text-slate-500">Complete your admission fee payment to confirm your seat.</p>
        </div>

        {/* Offer confirmation */}
        <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-teal-800">Admission Offer Confirmed</p>
            <p className="text-sm text-teal-700 mt-0.5">B.Tech — Computer Science · Application ADM2026-7K9P42</p>
            <p className="text-xs text-teal-600 mt-1">Offer valid until: 05 Dec 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Fee breakdown */}
          <Card className="md:col-span-3">
            <CardHeader><CardTitle>Fee Structure (Academic Year 2026–27)</CardTitle></CardHeader>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {feeBreakdown.map((f) => (
                    <tr key={f.label}>
                      <td className="px-5 py-3 text-slate-700">{f.label}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800">{formatCurrency(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-5 py-3 font-bold text-slate-800">Total Amount</td>
                    <td className="px-5 py-3 text-right font-bold text-blue-700 text-base">{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardBody>
          </Card>

          {/* Payment panel */}
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Pay Now</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Amount Due</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{formatCurrency(total)}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CreditCard className="w-4 h-4" />
                <span>Powered by Razorpay</span>
              </div>

              <Button className="w-full" size="lg" loading={loading} onClick={handlePayment} leftIcon={<IndianRupee className="w-4 h-4" />}>
                Pay {formatCurrency(total)}
              </Button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span>256-bit SSL encrypted · PCI DSS compliant</span>
              </div>
            </CardBody>
            <CardFooter>
              <p className="text-xs text-slate-500 text-center">Payment will be verified on the backend. Receipt generated only after confirmed payment.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

