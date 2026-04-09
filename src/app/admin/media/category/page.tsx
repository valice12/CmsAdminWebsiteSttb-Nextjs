"use client";

import { Layers, AlertCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MediaCategoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            Media Categories
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manajemen kategori untuk mengelompokkan konten media.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kategori..."
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white"
              disabled
            />
          </div>
          <Button disabled className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 opacity-50">
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-indigo-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Endpoint Belum Tersedia</h2>
          <p className="text-gray-500 font-medium">
            Halaman manajemen kategori media sedang dalam tahap persiapan. Fitur ini akan segera tersedia setelah endpoint backend diimplementasikan.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl px-8" onClick={() => window.history.back()}>
          Kembali
        </Button>
      </div>
    </div>
  );
}
