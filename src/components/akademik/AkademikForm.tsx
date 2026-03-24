"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAcademicProgramById, addAcademicProgram, editAcademicProgram } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, GraduationCap, School, BookOpen, Star, Info, ShieldCheck, Activity, Building } from 'lucide-react';
import { toast } from 'sonner';

const programSchema = z.object({
  programName: z.string().min(3, 'Nama program minimal 3 karakter'),
  programDescription: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  motto: z.string().min(5, 'Motto minimal 5 karakter'),
  degree: z.string().min(2, 'Jenjang wajib diisi'),
  accreditation: z.string().min(1, 'Akreditasi wajib diisi'),
  informedDescription: z.string().optional(),
  transformedDescription: z.string().optional(),
  transformativeDescription: z.string().optional(),
  programRequirements: z.string().optional(), // Will be converted to array
  totalCredits: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
});

type ProgramFormData = {
  programName: string;
  programDescription: string;
  motto: string;
  degree: string;
  accreditation: string;
  informedDescription?: string;
  transformedDescription?: string;
  transformativeDescription?: string;
  programRequirements?: string;
  totalCredits?: number;
  duration?: number;
};

interface AkademikFormProps {
  id?: string;
}

export function AkademikForm({ id }: AkademikFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      programName: '',
      motto: '',
      programDescription: '',
      degree: '',
      accreditation: '',
      informedDescription: '',
      transformedDescription: '',
      transformativeDescription: '',
      programRequirements: '',
      totalCredits: 144,
      duration: 8,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadProgram(parseInt(id));
    }
  }, [id, isEdit]);

  const loadProgram = async (programId: number) => {
    try {
      const program = await getAcademicProgramById(programId);
      if (program) {
        form.reset({
          programName: program.programName,
          motto: program.motto,
          programDescription: program.programDescription,
          degree: program.degree,
          accreditation: program.accreditation,
          informedDescription: program.informedDescription || '',
          transformedDescription: program.transformedDescription || '',
          transformativeDescription: program.transformativeDescription || '',
          programRequirements: program.programRequirements?.join('\n') || '',
          totalCredits: program.totalCredits || 144,
          duration: program.duration || 8,
        });
      }
    } catch (error) {
      toast.error('Gagal memuat data program studi');
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    try {
      const payload = {
        ...data,
        id: isEdit ? parseInt(id!) : undefined,
        programRequirements: data.programRequirements?.split('\n').filter(r => r.trim() !== '') || [],
        notes: [],
        lecturingSystem: [],
      };

      if (isEdit && id) {
        await editAcademicProgram(payload);
        toast.success('Program studi berhasil diperbarui');
      } else {
        await addAcademicProgram(payload);
        toast.success('Program studi berhasil ditambahkan');
      }
      router.push('/admin/akademik');
      router.refresh();
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui program studi' : 'Gagal menambahkan program studi');
      console.error(error);
    }
  };

  const degrees = ['S1', 'S2', 'S3', 'D3', 'D4'];
  const accreditations = ['A', 'B', 'C', 'Unggul', 'Baik Sekali'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/admin/akademik')}
            className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Program Studi' : 'Entry Program Baru'}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {isEdit ? 'Perbarui kurikulum dan informasi profil program studi.' : 'Tambahkan data program studi baru ke dalam sistem akademik.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Info Card */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
             <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                   <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-widest text-[10px]">Identitas Program</h3>
             </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Program Studi</label>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                       {...form.register('programName')} 
                       placeholder="e.g. Teknik Informatika" 
                       className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl text-base font-bold text-gray-700 shadow-inner focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Motto Program</label>
                  <div className="relative group">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                       {...form.register('motto')} 
                       placeholder="e.g. Innovating the Future" 
                       className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl text-base font-bold text-gray-700 shadow-inner focus:bg-white transition-all"
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Deskripsi & Profil Program</label>
                <div className="relative rounded-3xl overflow-hidden border border-gray-50 bg-gray-50/50 focus-within:bg-white transition-all shadow-inner">
                  <Textarea
                    {...form.register('programDescription')}
                    placeholder="Jelaskan visi, misi, dan profil lulusan..."
                    rows={6}
                    className="font-medium text-gray-700 p-8 border-none focus-visible:ring-0 resize-none leading-relaxed text-sm"
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Informed</label>
                  <Textarea {...form.register('informedDescription')} rows={4} className="rounded-2xl bg-gray-50 border-none shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transformed</label>
                  <Textarea {...form.register('transformedDescription')} rows={4} className="rounded-2xl bg-gray-50 border-none shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transformative</label>
                  <Textarea {...form.register('transformativeDescription')} rows={4} className="rounded-2xl bg-gray-50 border-none shadow-inner" />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          {/* Accreditation & Stats Card */}
          <div className="bg-[#0B1B3D] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-navy/30 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
            
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> Kredensial
            </h3>

            {/* Accreditation Select */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status Akreditasi</label>
              <div className="relative">
                 <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] z-10" />
                 <select
                   {...form.register('accreditation')}
                   className="w-full h-12 rounded-xl border-none bg-white/5 text-white pl-12 pr-4 text-xs font-black appearance-none focus:bg-white/10 transition-all cursor-pointer relative"
                 >
                   <option value="" className="bg-[#0B1B3D]">Pilih Akreditasi...</option>
                   {accreditations.map(a => (
                     <option key={a} value={a} className="bg-[#0B1B3D]">{a}</option>
                   ))}
                 </select>
              </div>
              {form.formState.errors.accreditation && (
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider ml-1 italic">{form.formState.errors.accreditation.message}</p>
              )}
            </div>

            {/* Degree Select */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Jenjang Pendidikan</label>
              <div className="grid grid-cols-3 gap-2">
                  {degrees.map(d => (
                     <button 
                        key={d}
                        type="button"
                        onClick={() => form.setValue('degree', d)}
                        className={`h-10 rounded-lg text-[10px] font-black transition-all border ${
                           form.watch('degree') === d 
                           ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                           : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                     >
                        {d}
                     </button>
                  ))}
              </div>
              {form.formState.errors.degree && (
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider ml-1 italic">{form.formState.errors.degree.message}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400">Total SKS</label>
                <Input type="number" {...form.register('totalCredits')} className="bg-white/5 border-none text-white h-10 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400">Durasi (Sem)</label>
                <Input type="number" {...form.register('duration')} className="bg-white/5 border-none text-white h-10 text-xs" />
              </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Persyaratan (Per baris)</label>
               <Textarea {...form.register('programRequirements')} rows={5} className="bg-white/5 border-none text-white text-[10px] rounded-xl" />
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-4 text-left">
             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <BookOpen className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold text-gray-800 uppercase tracking-widest text-[#D4AF37]">Informasi Penting</p>
             <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Pastikan informasi profil lulusan akurat karena data ini akan ditampilkan pada portal publik universitas sebagai panduan bagi calon mahasiswa baru.
             </p>
          </div>

          {/* Sticky Actions */}
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col gap-3 sticky bottom-8 z-10">
            <Button 
               type="submit" 
               isLoading={form.formState.isSubmitting}
               className="w-full h-14 rounded-2xl bg-[#D4AF37] hover:bg-[#C19B2E] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Simpan Perubahan' : 'Finalisasi & Simpan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/akademik')}
              className="w-full h-12 rounded-2xl font-black text-[10px] text-gray-500 hover:bg-gray-100 border-none uppercase tracking-widest"
            >
              Kembali
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
