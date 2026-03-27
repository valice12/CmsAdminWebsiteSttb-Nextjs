"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAcademicProgramById, addAcademicProgram, editAcademicProgram } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, Save, GraduationCap, School, BookOpen, Star, 
  Info, ShieldCheck, Activity, Building, Plus, Trash2, 
  ChevronDown, ChevronUp, Layers, BookMarked
} from 'lucide-react';
import { toast } from 'sonner';

const lectureSchema = z.object({
  lectureName: z.string().min(1, 'Nama mata kuliah wajib diisi'),
  credits: z.coerce.number().default(0),
  description: z.string().default(''),
});

const categorySchema = z.object({
  categoryName: z.string().min(1, 'Nama kategori wajib diisi'),
  totalCredits: z.coerce.number().default(0),
  lectures: z.array(lectureSchema).default([]),
});

const programSchema = z.object({
  programName: z.string().min(3, 'Nama program minimal 3 karakter'),
  programDescription: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  motto: z.string().min(5, 'Motto minimal 5 karakter'),
  degree: z.string().min(2, 'Jenjang wajib diisi'),
  informedDescription: z.string().optional(),
  transformedDescription: z.string().optional(),
  transformativeDescription: z.string().optional(),
  programRequirements: z.string().optional(),
  notes: z.string().optional(),
  lecturingSystem: z.string().optional(),
  totalCredits: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  isPublished: z.boolean(),
  lectureCategory: z.array(categorySchema),
});

type LectureData = {
  lectureName: string;
  credits: number;
  description: string;
};

type CategoryData = {
  categoryName: string;
  totalCredits: number;
  lectures: LectureData[];
};

type ProgramFormData = {
  programName: string;
  programDescription: string;
  motto: string;
  degree: string;
  informedDescription?: string;
  transformedDescription?: string;
  transformativeDescription?: string;
  programRequirements?: string;
  notes?: string;
  lecturingSystem?: string;
  totalCredits?: number;
  duration?: number;
  isPublished: boolean;
  lectureCategory: CategoryData[];
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
      informedDescription: '',
      transformedDescription: '',
      transformativeDescription: '',
      programRequirements: '',
      notes: '',
      lecturingSystem: '',
      totalCredits: 144,
      duration: 8,
      isPublished: true,
      lectureCategory: [],
    },
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "lectureCategory"
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
          informedDescription: program.informedDescription || '',
          transformedDescription: program.transformedDescription || '',
          transformativeDescription: program.transformativeDescription || '',
          programRequirements: program.programRequirements?.join('\n') || '',
          notes: program.notes?.join('\n') || '',
          lecturingSystem: program.lecturingSystem?.join('\n') || '',
          totalCredits: program.totalCredits || 144,
          duration: program.duration || 8,
          isPublished: program.isPublished ?? true,
          lectureCategory: program.lectureCategory || [],
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
        notes: data.notes?.split('\n').filter(r => r.trim() !== '') || [],
        lecturingSystem: data.lecturingSystem?.split('\n').filter(r => r.trim() !== '') || [],
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Sistem Perkuliahan (Per baris)</label>
                   <Textarea {...form.register('lecturingSystem')} rows={4} className="rounded-2xl bg-gray-50 border-none shadow-inner text-sm font-medium" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Catatan Tambahan (Per baris)</label>
                   <Textarea {...form.register('notes')} rows={4} className="rounded-2xl bg-gray-50 border-none shadow-inner text-sm font-medium" />
                </div>
             </div>
          </div>

          {/* Curriculum Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
             <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-widest text-[10px]">Struktur Kurikulum</h3>
                </div>
                <Button 
                  type="button" 
                  onClick={() => appendCategory({ categoryName: '', totalCredits: 0, lectures: [] })}
                  variant="outline"
                  className="rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
                </Button>
             </div>

             <div className="space-y-6">
                {categoryFields.map((category, categoryIndex) => (
                  <div key={category.id} className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 space-y-4 relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCategory(categoryIndex)}
                      className="absolute -top-2 -right-2 bg-white shadow-md rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kategori</label>
                        <Input 
                          {...form.register(`lectureCategory.${categoryIndex}.categoryName`)}
                          placeholder="e.g. Mata Kuliah Inti"
                          className="h-10 rounded-xl border-none shadow-inner bg-white font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total SKS</label>
                        <Input 
                          type="number"
                          {...form.register(`lectureCategory.${categoryIndex}.totalCredits`)}
                          className="h-10 rounded-xl border-none shadow-inner bg-white font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Sub-lectures */}
                    <LectureFields categoryIndex={categoryIndex} control={form.control} register={form.register} />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          {/* Accreditation & Stats Card */}
          <div className="bg-[#0B1B3D] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-navy/30 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
            
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> Kredensial & Status
            </h3>

            {/* Publication Status */}

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

interface LectureFieldsProps {
  categoryIndex: number;
  control: Control<ProgramFormData>;
  register: any;
}

function LectureFields({ categoryIndex, control, register }: { categoryIndex: number, control: Control<ProgramFormData>, register: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `lectureCategory.${categoryIndex}.lectures`
  });

  return (
    <div className="space-y-3 pl-4 border-l-2 border-primary/20 mt-4">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Daftar Mata Kuliah</label>
        <Button 
          type="button" 
          size="sm"
          onClick={() => append({ lectureName: '', credits: 3, description: '' })}
          className="h-7 text-[8px] font-black uppercase bg-primary/10 text-primary hover:bg-primary/20"
        >
          <Plus className="w-3 h-3 mr-1" /> Tambah Matkul
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((lecture, lectureIndex) => (
          <div key={lecture.id} className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group/item transition-all hover:shadow-md">
             <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(lectureIndex)}
                className="absolute top-2 right-2 h-6 w-6 text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
             >
                <Trash2 className="w-3 h-3" />
             </Button>

             <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <Input 
                    {...register(`lectureCategory.${categoryIndex}.lectures.${lectureIndex}.lectureName`)}
                    placeholder="Nama Mata Kuliah"
                    className="h-8 text-xs font-bold border-none bg-gray-50/50"
                  />
                </div>
                <div>
                  <Input 
                    type="number"
                    {...register(`lectureCategory.${categoryIndex}.lectures.${lectureIndex}.credits`)}
                    placeholder="SKS"
                    className="h-8 text-xs font-bold border-none bg-gray-50/50"
                  />
                </div>
             </div>
             <Textarea 
               {...register(`lectureCategory.${categoryIndex}.lectures.${lectureIndex}.description`)}
               placeholder="Deskripsi singkat mata kuliah..."
               rows={2}
               className="text-[10px] font-medium border-none bg-gray-50/50 p-2 min-h-[40px] resize-none"
             />
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-center py-4 text-[9px] text-gray-400 font-bold italic uppercase tracking-widest border border-dashed rounded-xl">
            Belum ada mata kuliah ditambahkan
          </p>
        )}
      </div>
    </div>
  );
}
