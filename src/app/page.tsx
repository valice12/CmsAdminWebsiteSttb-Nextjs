"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

import { getFirstAuthorizedPath } from '@/lib/navigation';

const signInSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignIn = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signIn(data);
      if (result.success && result.user) {
        toast.success(result.message);
        
        // Find first authorized path
        const redirectPath = getFirstAuthorizedPath(result.user.roles || []);
        router.push(redirectPath);
      } else if (result.success) {
        router.push('/admin/dashboard');
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1B3D] via-[#1E3A5F] to-[#0B1B3D] p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">CMS Admin Portal</h1>
          <p className="text-gray-300 font-medium">Sistem Manajemen Konten STTB</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1E293B] text-center">Sign In</h2>
            <p className="text-sm text-gray-500 text-center mt-1">Gunakan akun admin Anda untuk masuk</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...signInForm.register('email')}
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{signInForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...signInForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">{signInForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold bg-[#0B1B3D] hover:bg-[#1E3A5F]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">STT Bandung &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}
