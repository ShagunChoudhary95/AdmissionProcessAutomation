import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormField, Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data);
      const { user, token } = res.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'officer') navigate('/officer/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-800" />
          </div>
          <span className="text-white font-bold text-lg">AdmissionPortal</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Streamlined<br />Admission Management
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
            A complete digital platform for managing university admissions — from registration to confirmation.
          </p>
          <div className="mt-8 space-y-3">
            {['Automated eligibility checking', 'Document verification workflow', 'Real-time application tracking', 'Secure payment processing'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-400 text-xs">© 2026 AdmissionPortal. All rights reserved.</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-md lg:w-full">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-blue-900">AdmissionPortal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email address" required error={errors.email?.message}>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </FormField>

            <FormField label="Password" required error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-700 font-medium hover:text-blue-800">
                Register as Student
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-700 mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-amber-700">
              <p><span className="font-medium">Student:</span> student@demo.com / demo1234</p>
              <p><span className="font-medium">Admin:</span> admin@demo.com / demo1234</p>
              <p><span className="font-medium">Officer:</span> officer@demo.com / demo1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

