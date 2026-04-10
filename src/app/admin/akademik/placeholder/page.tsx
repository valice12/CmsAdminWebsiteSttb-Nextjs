"use client";

import { GraduationCap, AlertCircle, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcademicPlaceholderPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Program Akademik - Extra
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Halaman placeholder untuk sub-menu akademik yang akan datang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder Content */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-12 flex flex-col items-start text-left space-y-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Academic Structure</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Halaman ini disiapkan sebagai placeholder untuk pengaturan akademik tambahan seperti manajemen kurikulum detail, tahun ajaran, atau pemetaan dosen pengampu.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl px-8" onClick={() => window.history.back()}>
            Kembali
          </Button>
        </div>

        <div className="bg-primary/5 rounded-[2rem] border border-primary/10 p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-primary font-bold text-sm uppercase tracking-widest">Under Construction</p>
          <p className="text-gray-600 text-sm font-medium">
            Fitur ini akan diaktifkan secara otomatis setelah struktur katalog data akademik diperluas.
          </p>
        </div>
      </div>
    </div>
  );
}
