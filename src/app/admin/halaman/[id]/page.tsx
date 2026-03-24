"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, Layout, Layers, Sparkles, Wand2, Info, Users as UsersIcon, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PageSection {
  id: string;
  title: string;
  content: string;
}

export default function HalamanFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sections, setSections] = useState<PageSection[]>([
    { id: '1', title: '', content: '' },
  ]);

  const pageInfo: Record<string, { title: string; description: string, icon: any }> = {
    tentang: {
      title: 'Tentang Kami',
      description: 'Edit informasi visi, misi, dan sejarah universitas.',
      icon: <Info className="w-6 h-6" />
    },
    admisi: {
      title: 'Admisi & Pendaftaran',
      description: 'Edit FAQ pendaftaran dan syarat masuk.',
      icon: <UsersIcon className="w-6 h-6" />
    },
    keuangan: {
      title: 'Keuangan & Beasiswa',
      description: 'Edit rincian biaya dan informasi beasiswa.',
      icon: <DollarSign className="w-6 h-6" />
    },
    lainnya: {
      title: 'Halaman Lainnya',
      description: 'Edit konten informasi tambahan dan kontak.',
      icon: <FileText className="w-6 h-6" />
    },
  };

  const currentPage = id && typeof id === 'string' ? pageInfo[id] : null;

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const savedContent = localStorage.getItem(`cms_page_${id}`);
      if (savedContent) {
        try {
          setSections(JSON.parse(savedContent));
        } catch (e) {
          console.error("Failed to parse saved content", e);
        }
      }
    }
  }, [id]);

  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now().toString(), title: '', content: '' },
    ]);
    toast.success('Seksi baru ditambahkan');
  };

  const removeSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId));
      toast.info('Seksi dihapus');
    }
  };

  const updateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cms_page_${id}`, JSON.stringify(sections));
      toast.success('Konten halaman berhasil disimpan');
      router.push('/admin/halaman');
    }
  };

  if (!currentPage) {
    return <div className="p-10 text-center font-black text-gray-400 uppercase tracking-widest">Halaman Tidak Ditemukan</div>;
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/halaman')}
            className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-gray-200/50 hover:bg-gray-50 text-gray-400 hover:text-primary transition-all p-0 flex items-center justify-center border border-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
               <span className="text-primary">{currentPage.icon}</span>
               {currentPage.title}
            </h1>
            <p className="text-muted-foreground font-medium text-lg mt-1">
              {currentPage.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/admin/halaman')}
            variant="outline" 
            className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest border-none bg-white shadow-xl shadow-gray-200/50 hover:bg-gray-50 text-gray-500"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave}
            className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Editor Guide */}
      <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex items-center gap-6 text-left">
         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 shrink-0">
            <Layout className="w-8 h-8" />
         </div>
         <div>
            <h3 className="text-xl font-black text-primary tracking-tight">Struktur Halaman Dinamis</h3>
            <p className="text-sm text-primary/70 font-medium leading-relaxed mt-1">
               Gunakan sistem <b>Seksi</b> untuk memisahkan paragraf atau sub-judul. Setiap seksi akan dirender secara berurutan pada halaman portal utama.
            </p>
         </div>
      </div>

      {/* Sections List */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="group relative bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/40 border border-gray-100 transition-all hover:border-primary/20 text-left"
          >
             {/* Section Badge */}
              <div className="absolute -left-3 top-10 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl shadow-black/20 origin-left scale-110">
                 Seksi {index + 1}
              </div>

            <div className="flex items-center justify-end gap-2 mb-8">
               <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeSection(section.id)}
                  className="h-10 w-10 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
               >
                  <Trash2 className="w-4 h-4" />
               </Button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                   <Layers className="w-3 h-3" /> Judul Bagian / Sub-judul
                </label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  placeholder="Contoh: Sejarah Singkat STT Bandung"
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white text-lg font-bold placeholder:text-gray-300 placeholder:font-medium transition-all"
                />
              </div>

              <div className="space-y-3 text-left">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 ml-1">
                   <Wand2 className="w-3 h-3" /> Konten Utama (Rich Text)
                </label>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  placeholder="Tuliskan deskripsi lengkap di sini..."
                  rows={10}
                  className="rounded-[2.5rem] border-gray-100 bg-gray-50/50 focus:bg-white text-base font-medium leading-relaxed placeholder:font-medium transition-all p-8"
                />
              </div>
            </div>
          </div>
        ))}

         {/* Add Section Button */}
         <Button 
           variant="outline" 
           onClick={addSection}
           className="w-full h-24 rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-white hover:bg-primary/5 hover:border-primary/20 text-gray-400 hover:text-primary transition-all flex flex-col items-center justify-center gap-2"
         >
           <Plus className="w-8 h-8" />
           <span className="font-black text-[10px] uppercase tracking-[0.2em] ml-1">Tambah Seksi Baru</span>
         </Button>
      </div>

       {/* Floating Action Bar */}
       <div className="sticky bottom-8 z-20 flex justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] shadow-2xl flex items-center gap-4 scale-110">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-5 mr-10 leading-none">
                 Penyimpanan Otomatis Aktif
              </p>
              <Button 
                onClick={handleSave}
                className="h-12 px-8 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Simpan Sekarang
              </Button>
          </div>
       </div>
    </div>
  );
}
