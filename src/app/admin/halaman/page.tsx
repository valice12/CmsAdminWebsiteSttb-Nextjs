"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Info, DollarSign, Users as UsersIcon, ArrowRight, Layout, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HalamanPage() {
  const router = useRouter();

  const pages = [
    {
      id: 'tentang',
      title: 'Tentang Kami',
      description: 'Visi, Misi, Sejarah, dan Profil Universitas STT Bandung.',
      icon: <Info className="w-6 h-6" />,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200',
      stats: '4 Seksi'
    },
    {
      id: 'admisi',
      title: 'Admisi & Pendaftaran',
      description: 'FAQ pendaftaran, Syarat Mahasiswa Baru, dan Jalur Masuk.',
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
      stats: '3 Seksi'
    },
    {
      id: 'keuangan',
      title: 'Keuangan & Beasiswa',
      description: 'Rincian Biaya Kuliah, Program Beasiswa, dan Metode Pembayaran.',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-amber-600',
      shadow: 'shadow-amber-200',
      stats: '5 Seksi'
    },
    {
      id: 'lainnya',
      title: 'Halaman Lainnya',
      description: 'Kontak, Fasilitas Kampus, dan informasi institusional tambahan.',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-600',
      shadow: 'shadow-purple-200',
      stats: '2 Seksi'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-2 text-left">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
               <Layout className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Halaman Statis</h1>
         </div>
         <p className="text-muted-foreground font-medium text-lg ml-1">
            Kelola konten informasi institusional yang ditampilkan pada portal publik.
         </p>
      </div>

      {/* Grid Layout for Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {pages.map((page) => (
          <div
            key={page.id}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-primary/20 transition-all hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
          >
             {/* Decorative Background Icon */}
             <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <div className="scale-[3] text-gray-900">
                   {page.icon}
                </div>
             </div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={`${page.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${page.shadow} group-hover:scale-110 transition-transform`}>
                        {page.icon}
                    </div>
                    <Badge variant="outline" className="font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 bg-gray-50 border-gray-100">
                        {page.stats}
                    </Badge>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors">{page.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {page.description}
                </p>
             </div>

             <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                   <Settings className="w-3 h-3" />
                   Last Update: Today
                </div>
                <Button
                  onClick={() => router.push(`/admin/halaman/${page.id}`)}
                  className="bg-gray-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 h-11 rounded-xl shadow-xl shadow-gray-200 transition-all flex items-center gap-2"
                >
                  Edit Halaman <ArrowRight className="w-4 h-4" />
                </Button>
             </div>
          </div>
        ))}
      </div>

      {/* Modern Info Box / Guide */}
      <div className="relative bg-[#0B1B3D] rounded-[3rem] p-12 text-white overflow-hidden shadow-2xl shadow-primary/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
           <div className="w-20 h-20 bg-[#D4AF37] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 flex-shrink-0 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
           </div>
           <div className="text-left space-y-4">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">Optimasi Konten Statis</h3>
              <p className="text-gray-300 font-medium leading-relaxed max-w-2xl text-lg">
                Halaman statis merupakan wajah pertama universitas. Pastikan informasi seperti <b>Sejarah</b>, <b>Biaya Kuliah</b>, dan <b>FAQ</b> selalu diperbarui agar calon mahasiswa mendapatkan informasi yang valid.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
