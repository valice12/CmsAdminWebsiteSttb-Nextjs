"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signUp, initializeAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Mail, Lock, User, Terminal } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const signUpSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignIn = (data: SignInFormData) => {
    const result = signIn(data);
    if (result.success) {
      toast.success(result.message);
      router.push('/admin/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleSignUp = (data: SignUpFormData) => {
    const result = signUp({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.success) {
      toast.success(result.message);
      setMode('signin');
      signUpForm.reset();
    } else {
      toast.error(result.message);
    }
  };

  // Backdoor login function
  const handleBackdoor = () => {
    const result = signIn({
      email: 'admin@university.ac.id',
      password: 'admin123'
    });
    if (result.success) {
      toast.success("Bypassed: Login Berhasil via Backdoor");
      router.push('/admin/dashboard');
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

        {/* Login/Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#1E293B] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#1E293B] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...signInForm.register('email')}
                    type="email"
                    placeholder="admin@university.ac.id"
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
                className="w-full h-11 font-bold"
                disabled={signInForm.formState.isSubmitting}
              >
                Sign In
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Developer Backdoor</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackdoor}
                className="w-full h-11 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold gap-2"
              >
                <Terminal className="w-4 h-4" /> Bypas Login (Quick Access)
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...signUpForm.register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
                {signUpForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...signUpForm.register('email')}
                    type="email"
                    placeholder="your.email@university.ac.id"
                    className="pl-10"
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...signUpForm.register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 text-left">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...signUpForm.register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-bold"
                disabled={signUpForm.formState.isSubmitting}
              >
                Daftar Akun
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed px-4">
                Setelah mendaftar, akun Anda akan diverifikasi oleh Super Admin sebelum dapat digunakan.
              </p>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">STT Bandung &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}
