import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { FormField, Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services';
import toast from 'react-hot-toast';

const schema = z.object({
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Select gender'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid mobile number'),
  alternatePhone: z.string().optional(),
  category: z.string().min(1, 'Select category'),
  religion: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  domicileState: z.string().min(1, 'Domicile state is required'),
  parentName: z.string().min(2, 'Parent/Guardian name is required'),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid mobile number'),
  parentOccupation: z.string().optional(),
  annualIncome: z.string().optional(),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
});

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function PersonalDetails() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nationality: 'Indian' },
  });

  useEffect(() => {
    studentService.getProfile().then((res) => {
      if (res.data.profile?.personal) {
        reset({ nationality: 'Indian', ...res.data.profile.personal });
      }
    }).catch(() => {});
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      await studentService.updatePersonal(data);
      toast.success('Personal details saved successfully.');
      navigate('/student/academic');
    } catch {
      toast.error('Failed to save. Please try again.');
    }
  };

  return (
    <DashboardLayout role="student">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
          <p className="text-sm text-slate-500">Fill in your personal information as per official documents.</p>
        </div>

        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date of Birth" required error={errors.dob?.message}>
              <Input type="date" {...register('dob')} error={errors.dob?.message} />
            </FormField>
            <FormField label="Gender" required error={errors.gender?.message}>
              <Select {...register('gender')} error={errors.gender?.message}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </Select>
            </FormField>
            <FormField label="Mobile Number" required error={errors.phone?.message}>
              <Input type="tel" placeholder="10-digit mobile" {...register('phone')} error={errors.phone?.message} />
            </FormField>
            <FormField label="Alternate Number" error={errors.alternatePhone?.message}>
              <Input type="tel" placeholder="Optional" {...register('alternatePhone')} />
            </FormField>
            <FormField label="Category" required error={errors.category?.message}>
              <Select {...register('category')} error={errors.category?.message}>
                <option value="">Select category</option>
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>EWS</option>
              </Select>
            </FormField>
            <FormField label="Religion" error={errors.religion?.message}>
              <Select {...register('religion')}>
                <option value="">Select (optional)</option>
                <option>Hindu</option><option>Muslim</option><option>Christian</option>
                <option>Sikh</option><option>Buddhist</option><option>Jain</option><option>Other</option>
              </Select>
            </FormField>
            <FormField label="Nationality" required error={errors.nationality?.message}>
              <Input {...register('nationality')} error={errors.nationality?.message} />
            </FormField>
            <FormField label="Domicile State" required error={errors.domicileState?.message}>
              <Select {...register('domicileState')} error={errors.domicileState?.message}>
                <option value="">Select state</option>
                {indianStates.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormField>
          </CardBody>
        </Card>

        {/* Parent/Guardian */}
        <Card>
          <CardHeader><CardTitle>Parent / Guardian Information</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Parent/Guardian Name" required error={errors.parentName?.message} className="sm:col-span-2">
              <Input placeholder="Full name" {...register('parentName')} error={errors.parentName?.message} />
            </FormField>
            <FormField label="Parent Mobile" required error={errors.parentPhone?.message}>
              <Input type="tel" placeholder="10-digit mobile" {...register('parentPhone')} error={errors.parentPhone?.message} />
            </FormField>
            <FormField label="Occupation" error={errors.parentOccupation?.message}>
              <Input placeholder="e.g. Farmer, Teacher, Business" {...register('parentOccupation')} />
            </FormField>
            <FormField label="Annual Family Income" error={errors.annualIncome?.message} className="sm:col-span-2">
              <Select {...register('annualIncome')}>
                <option value="">Select range</option>
                <option>Below ₹1 Lakh</option>
                <option>₹1–2.5 Lakh</option>
                <option>₹2.5–5 Lakh</option>
                <option>₹5–8 Lakh</option>
                <option>Above ₹8 Lakh</option>
              </Select>
            </FormField>
          </CardBody>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader><CardTitle>Correspondence Address</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Address Line 1" required error={errors.addressLine1?.message} className="sm:col-span-2">
              <Input placeholder="House no., street name" {...register('addressLine1')} error={errors.addressLine1?.message} />
            </FormField>
            <FormField label="Address Line 2" className="sm:col-span-2">
              <Input placeholder="Village, landmark (optional)" {...register('addressLine2')} />
            </FormField>
            <FormField label="City / District" required error={errors.city?.message}>
              <Input placeholder="City" {...register('city')} error={errors.city?.message} />
            </FormField>
            <FormField label="State" required error={errors.state?.message}>
              <Select {...register('state')} error={errors.state?.message}>
                <option value="">Select state</option>
                {indianStates.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Pincode" required error={errors.pincode?.message}>
              <Input placeholder="6-digit pincode" maxLength={6} {...register('pincode')} error={errors.pincode?.message} />
            </FormField>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/student/dashboard')}>Back</Button>
            <Button type="submit" loading={isSubmitting}>Save & Continue</Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
}

