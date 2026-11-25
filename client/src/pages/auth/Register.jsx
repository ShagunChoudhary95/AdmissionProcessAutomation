import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormField, Input } from '../../components/ui/Input';
import { authService } from '../../services';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.register(data);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-blue-900 text-lg">AdmissionPortal</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800">Create student account</h1>
            <p className="text-sm text-slate-500 mt-1">Register to begin your admission process</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full Name" required error={errors.name?.message}>
              <Input placeholder="As per 10th marksheet" {...register('name')} error={errors.name?.message} />
            </FormField>

            <FormField label="Email Address" required error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
            </FormField>

            <FormField label="Mobile Number" required error={errors.phone?.message}>
              <Input type="tel" placeholder="10-digit mobile number" {...register('phone')} error={errors.phone?.message} />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Password" required error={errors.password?.message}>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    {...register('password')}
                    error={errors.password?.message}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </FormField>
            </div>

            <Button type="submit" className="w-full mt-2" loading={isSubmitting} size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:text-blue-800">Sign in</Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          This portal is for student registration only. Admin and officer accounts are created by the administration.
        </p>
      </div>
    </div>
  );
}

