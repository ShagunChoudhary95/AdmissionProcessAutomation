import { useState, useEffect } from 'react';
import { Shield, CreditCard, IndianRupee, CheckCircle, Smartphone, Building2, QrCode, Lock, Check } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { applicationService, paymentService } from '../../services';
import toast from 'react-hot-toast';

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'IDBI Bank',
  'IndusInd Bank',
  'Federal Bank',
  'Yes Bank',
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', handle: '@okhdfcbank' },
  { id: 'phonepe', name: 'PhonePe', handle: '@ybl' },
  { id: 'paytm', name: 'Paytm', handle: '@paytm' },
  { id: 'bhim', name: 'BHIM UPI', handle: '@upi' },
];

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [app, setApp] = useState(null);
  const [appId, setAppId] = useState(null);
  const navigate = useNavigate();

  // Payment method state
  const [method, setMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8921 4455 1209');
  const [cardName, setCardName] = useState('Aarav Sharma');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  // UPI details
  const [upiId, setUpiId] = useState('student@okhdfcbank');
  const [upiMode, setUpiMode] = useState('id'); // 'id' | 'qr'

  // Net banking details
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [otherBank, setOtherBank] = useState('');

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await applicationService.getMy();
        const liveApp = res.data.application || (res.data.applications && res.data.applications[0]);
        if (liveApp) {
          setApp(liveApp);
          setAppId(liveApp._id);
          if (liveApp.studentName) {
            setCardName(liveApp.studentName);
          }
          if (liveApp.status === 'Admission Confirmed') {
            toast.success('Your admission is already confirmed!');
            navigate('/student/receipt');
          }
        }
      } catch (err) {
        console.error('Failed to load application for payment:', err);
      }
    }
    loadApp();
  }, [navigate]);

  const courseFee = app?.branch?.totalFee || app?.branch?.admissionFee || 135000;
  const tuition = courseFee > 5000 ? courseFee - 5000 : courseFee;
  const total = courseFee;

  const feeBreakdown = [
    { label: 'Tuition Fee (Annual)', amount: tuition },
    { label: 'Admission & Registration Fee', amount: 5000 },
  ];

  const getPaymentMethodLabel = () => {
    if (method === 'card') {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '1209';
      return `Credit Card (ending in ${last4})`;
    } else if (method === 'upi') {
      return `UPI (${upiId || 'Instant UPI'})`;
    } else {
      const bank = POPULAR_BANKS.find(b => b.id === selectedBank)?.name || otherBank || 'State Bank of India';
      return `Net Banking (${bank})`;
    }
  };

  const handlePayment = async () => {
    if (!appId) {
      toast.error('No active application found to pay fees for.');
      return;
    }

    if (method === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || !cardCvv) {
        toast.error('Please fill in card expiry and CVV.');
        return;
      }
    } else if (method === 'upi' && upiMode === 'id') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. user@bank).');
        return;
      }
    }

    setLoading(true);
    try {
      const orderRes = await paymentService.createOrder(appId);
      const { orderId, amount, currency, keyId } = orderRes.data;
      const paymentMethodLabel = getPaymentMethodLabel();

      if (window.Razorpay && keyId && !keyId.includes('mock')) {
        const options = {
          key: keyId,
          amount: amount * 100,
          currency: currency || 'INR',
          name: 'ABES Engineering College',
          description: `Admission Fee - ${app?.course?.name || 'Programme'}`,
          order_id: orderId,
          handler: async (response) => {
            try {
              await paymentService.verify({
                applicationId: appId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: paymentMethodLabel,
              });
              toast.success(`Payment verified via ${paymentMethodLabel}! Admission confirmed.`);
              navigate('/student/receipt');
            } catch {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: app?.studentName || cardName || '',
            email: app?.email || '',
          },
          theme: { color: '#1e3a8a' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation with chosen payment method
        await paymentService.verify({
          applicationId: String(appId),
          razorpayOrderId: orderId,
          razorpayPaymentId: 'pay_' + Date.now(),
          razorpaySignature: 'sig_test_verified',
          paymentMethod: paymentMethodLabel,
        });
        toast.success(`Payment verified via ${paymentMethodLabel}! Admission confirmed.`);
        navigate('/student/receipt');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Payment initiation failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Complete Admission Fee Payment</h2>
          <p className="text-sm text-slate-500">Choose your preferred payment method to secure and confirm your seat.</p>
        </div>

        {/* Offer confirmation */}
        <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-800">Admission Offer Confirmed & Seat Reserved</p>
            <p className="text-sm text-teal-700 mt-0.5">
              {(app?.course?.name || app?.courseId?.name || 'Bachelor of Technology (B.Tech)')} — {(app?.branch?.name || app?.branchId?.name || 'Computer Science & Engineering')} · Application #{app?.applicationNumber || 'ADM2026-PENDING'}
            </p>
            <p className="text-xs text-teal-600 mt-1 font-medium">
              Offer Reservation Valid Until: {app?.offerExpiresAt ? formatDate(app.offerExpiresAt) : '7 Days from Offer Date'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Payment Method Selection */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardBody className="space-y-5 pt-4">
                {/* Method Navigation Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      method === 'card'
                        ? 'bg-white text-blue-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      method === 'upi'
                        ? 'bg-white text-blue-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI (GPay / PhonePe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('netbanking')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      method === 'netbanking'
                        ? 'bg-white text-blue-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* 1. CREDIT / DEBIT CARD PANEL */}
                {method === 'card' && (
                  <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Card Details</span>
                      <div className="flex gap-1.5 text-slate-400">
                        <span className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-bold text-blue-700">VISA</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-bold text-amber-600">MasterCard</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-bold text-teal-600">RuPay</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8921 4455 1209"
                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-mono tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as printed on card"
                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. UPI PANEL */}
                {method === 'upi' && (
                  <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="flex gap-3 border-b border-slate-200 pb-3">
                      <button
                        type="button"
                        onClick={() => setUpiMode('id')}
                        className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                          upiMode === 'id' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
                        }`}
                      >
                        Enter UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode('qr')}
                        className={`text-xs font-semibold pb-1 border-b-2 transition-all ${
                          upiMode === 'qr' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
                        }`}
                      >
                        Scan QR Code
                      </button>
                    </div>

                    {upiMode === 'id' ? (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-slate-600">Virtual Payment Address (VPA)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@bank"
                            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-500 mb-2">Or click your UPI provider:</p>
                          <div className="flex flex-wrap gap-2">
                            {UPI_APPS.map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => {
                                  const username = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'student';
                                  setUpiId(`${username}${app.handle}`);
                                }}
                                className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-blue-500 rounded text-slate-700 font-medium transition-all"
                              >
                                {app.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="w-36 h-36 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 mb-2">
                          <QrCode className="w-24 h-24 text-slate-700" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">Scan QR Code with any UPI App</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Google Pay · PhonePe · Paytm · BHIM</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. NET BANKING PANEL */}
                {method === 'netbanking' && (
                  <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Popular Banks</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => { setSelectedBank(b.id); setOtherBank(''); }}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                            selectedBank === b.id && !otherBank
                              ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{b.name}</span>
                          {selectedBank === b.id && !otherBank && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Or Select Other Bank</label>
                      <select
                        value={otherBank}
                        onChange={(e) => { setOtherBank(e.target.value); setSelectedBank(''); }}
                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Choose from 40+ other banks --</option>
                        {OTHER_BANKS.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right: Order Summary & Confirmation */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle>Fee Structure (AY 2026–27)</CardTitle>
              </CardHeader>
              <CardBody className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {feeBreakdown.map((f) => (
                      <tr key={f.label}>
                        <td className="px-4 py-2.5 text-slate-600 text-xs">{f.label}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-800 text-xs">{formatCurrency(f.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-4 py-3 font-bold text-slate-800 text-sm">Total Payable</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-700 text-base">{formatCurrency(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">Selected Payment Mode:</p>
                  <p className="text-sm font-bold text-blue-900 mt-0.5">{getPaymentMethodLabel()}</p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  loading={loading}
                  onClick={handlePayment}
                  leftIcon={<IndianRupee className="w-4 h-4" />}
                >
                  Pay {formatCurrency(total)}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>256-bit Bank Grade Security · PCI DSS Compliant</span>
                </div>
              </CardBody>
              <CardFooter className="pt-0">
                <p className="text-[11px] text-slate-400 text-center leading-normal">
                  Official confirmation receipt with seal and transaction ID will be instantly generated upon payment.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
