"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Control, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Save, GraduationCap, School, BookOpen, Star, 
  Info, ShieldCheck, Activity, Building, Plus, Trash2, 
  ChevronDown, ChevronUp, Layers, BookMarked, ExternalLink,
  Search, Check, AlertCircle
} from 'lucide-react';
import { 
  getAcademicProgramById, 
  addAcademicProgram, 
  editAcademicProgram,
  getAllCourses
} from '@/lib/api';
import { toast } from 'sonner';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';

const lectureSchema = z.object({
  id: z.coerce.number(), // This is the Course ID (from database)
  courseName: z.string().optional(),
  credits: z.coerce.number(),
  description: z.string().optional(),
});

const categorySchema = z.object({
  categoryName: z.string().min(1, 'Nama kategori wajib diisi'),
  totalCredits: z.coerce.number(),
  courses: z.array(lectureSchema),
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
  courseCategory: z.array(categorySchema),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface AkademikFormProps {
  id?: string;
}

export function AkademikForm({ id }: AkademikFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: {
      programName: '',
      motto: '',
      programDescription: '',
      degree: 'S1',
      informedDescription: '',
      transformedDescription: '',
      transformativeDescription: '',
      programRequirements: '',
      notes: '',
      lecturingSystem: '',
      totalCredits: 144,
      duration: 8,
      isPublished: true,
      courseCategory: [],
    },
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "courseCategory"
  });

  // Watch for course changes to automate SKS
  const watchedCategories = form.watch("courseCategory");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourses(1, 100, '', true);
      setAvailableCourses(data.items || data.Items || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Automate Category Total SKS & Program Total SKS
  useEffect(() => {
    if (!watchedCategories) return;

    let programTotal = 0;
    watchedCategories.forEach((category, index) => {
      const categorySks = category.courses?.reduce((sum, course) => sum + (Number(course.credits) || 0), 0) || 0;
      
      // Update Category Total if changed
      if (form.getValues(`courseCategory.${index}.totalCredits`) !== categorySks) {
        form.setValue(`courseCategory.${index}.totalCredits`, categorySks, { shouldValidate: true });
      }
      programTotal += categorySks;
    });

    // Update Program Total if changed
    if (form.getValues('totalCredits') !== programTotal) {
      form.setValue('totalCredits', programTotal, { shouldValidate: true });
    }
  }, [watchedCategories]);

  // Automate Default SKS & Duration based on Degree
  const watchedDegree = form.watch('degree');
  useEffect(() => {
    if (isEdit) return; // Don't overwrite existing data on edit
    
    switch (watchedDegree) {
      case 'S1':
        form.setValue('totalCredits', 144);
        form.setValue('duration', 8);
        break;
      case 'S2':
        form.setValue('totalCredits', 36);
        form.setValue('duration', 4);
        break;
      case 'S3':
        form.setValue('totalCredits', 42);
        form.setValue('duration', 6);
        break;
      case 'D3':
        form.setValue('totalCredits', 110);
        form.setValue('duration', 6);
        break;
    }
  }, [watchedDegree, isEdit]);

  useEffect(() => {
    if (isEdit && id) {
      loadProgram(parseInt(id));
    }
  }, [id, isEdit]);

  const loadProgram = async (programId: number) => {
    try {
      const program = await getAcademicProgramById(programId);
      if (program) {
        const rawCategories = program.courseCategory || program.lectureCategory || [];
        // Map backend structure (which might have Course data) to our form structure
        const mappedCategories = rawCategories.map((cat: any) => ({
           categoryName: cat.categoryName || cat.name,
           totalCredits: cat.totalCredits || 0,
           courses: (cat.courses || cat.lectures || []).map((c: any) => ({
              id: c.id,
              courseName: c.courseName || c.name,
              credits: c.credits || 0,
              description: c.description || ''
           }))
        }));

        form.reset({
          programName: program.programName || program.name,
          motto: program.motto,
          programDescription: program.programDescription || program.graduateProfileDescription,
          degree: program.degree || program.degreeAbbr,
          informedDescription: program.informedDescription || '',
          transformedDescription: program.transformedDescription || '',
          transformativeDescription: program.transformativeDescription || '',
          programRequirements: program.programRequirements?.join('\n') || '',
          notes: program.notes?.join('\n') || '',
          lecturingSystem: program.lecturingSystem?.join('\n') || '',
          totalCredits: program.totalCredits || 0,
          duration: program.duration || program.studyDuration || 8,
          isPublished: program.isPublished ?? true,
          courseCategory: mappedCategories,
        });
      }
    } catch (error) {
      toast.error('Gagal memuat data program studi');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formValues = data as any;
      const payload = {
        ...formValues,
        id: isEdit ? parseInt(id!) : undefined,
        programRequirements: formValues.programRequirements?.split('\n').filter((r: string) => r.trim() !== '') || [],
        notes: formValues.notes?.split('\n').filter((r: string) => r.trim() !== '') || [],
        lecturingSystem: formValues.lecturingSystem?.split('\n').filter((r: string) => r.trim() !== '') || [],
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

  const onInvalid = (errors: any) => {
    console.dir(errors);
    toast.error('Penyimpanan gagal. Harap lengkapi semua bidang yang wajib diisi.');
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
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
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
                       className={`pl-12 h-14 rounded-2xl text-base font-bold shadow-inner transition-all ${
                         form.formState.errors.programName 
                         ? 'border-red-500 bg-red-50/50' 
                         : 'bg-gray-50/50 border-none focus:bg-white text-gray-700'
                       }`}
                    />
                  </div>
                  {form.formState.errors.programName && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.programName.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Motto Program</label>
                  <div className="relative group">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                       {...form.register('motto')} 
                       placeholder="e.g. Innovating the Future" 
                       className={`pl-12 h-14 rounded-2xl text-base font-bold shadow-inner transition-all ${
                         form.formState.errors.motto 
                         ? 'border-red-500 bg-red-50/50' 
                         : 'bg-gray-50/50 border-none focus:bg-white text-gray-700'
                       }`}
                    />
                  </div>
                  {form.formState.errors.motto && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.motto.message as string}</p>}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Deskripsi & Profil Program</label>
                <div className={`relative rounded-3xl overflow-hidden transition-all shadow-inner border ${
                  form.formState.errors.programDescription 
                  ? 'border-red-500 bg-red-50/50' 
                  : 'border-gray-50 bg-gray-50/50 focus-within:bg-white'
                }`}>
                  <Textarea
                    {...form.register('programDescription')}
                    placeholder="Jelaskan visi, misi, dan profil lulusan..."
                    rows={6}
                    className="font-medium text-gray-700 p-8 border-none focus-visible:ring-0 resize-none leading-relaxed text-sm bg-transparent"
                  />
                </div>
                {form.formState.errors.programDescription && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.programDescription.message as string}</p>}
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
             {/* Instructional Note */}
             <div className="bg-amber-50/50 rounded-[2rem] p-6 border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight">Pusat Data Kurikulum</h4>
                        <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed mt-0.5">
                            Mata kuliah dikelola secara terpusat. Gunakan menu Kelola Mata Kuliah untuk menambah data baru.
                        </p>
                    </div>
                </div>
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.open('/admin/akademik/mata-kuliah', '_blank')}
                    className="rounded-xl border-amber-200 bg-white text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap h-10"
                >
                    <ExternalLink className="w-3 h-3 mr-2" /> Kelola MK
                </Button>
             </div>

             <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase tracking-widest text-[10px]">Struktur Kurikulum</h3>
                </div>
                <Button 
                  type="button" 
                  onClick={() => appendCategory({ categoryName: '', totalCredits: 0, courses: [] })}
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
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Nama Kategori</label>
                        <Input 
                          {...form.register(`courseCategory.${categoryIndex}.categoryName`)}
                          placeholder="e.g. Mata Kuliah Inti"
                          className="h-10 rounded-xl border-none shadow-inner bg-white font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Total SKS</label>
                        <Input 
                          type="number"
                          {...form.register(`courseCategory.${categoryIndex}.totalCredits`)}
                          className="h-10 rounded-xl border-none shadow-inner bg-white font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Sub-lectures */}
                    <LectureFields 
                        categoryIndex={categoryIndex} 
                        control={form.control} 
                        register={form.register} 
                        availableCourses={availableCourses}
                        setValue={form.setValue}
                    />
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
  control: any;
  register: any;
  availableCourses: any[];
  setValue: any;
}

function LectureFields({ categoryIndex, control, register, availableCourses, setValue }: LectureFieldsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: `courseCategory.${categoryIndex}.courses`
  });

  const watchedCourses = useWatch({
    control,
    name: `courseCategory.${categoryIndex}.courses`
  });

  const handleCourseSelection = (lectureIndex: number, courseId: string) => {
     const courseIdNum = Number(courseId);
     const course = availableCourses.find(c => c.id === courseIdNum);
     if (course) {
        setValue(`courseCategory.${categoryIndex}.courses.${lectureIndex}.id`, course.id);
        setValue(`courseCategory.${categoryIndex}.courses.${lectureIndex}.courseName`, course.courseName);
        setValue(`courseCategory.${categoryIndex}.courses.${lectureIndex}.credits`, course.credits);
        setValue(`courseCategory.${categoryIndex}.courses.${lectureIndex}.description`, course.description);
     }
  };

  const handleAddNewCourse = (courseId: string) => {
    const courseIdNum = Number(courseId);
    const course = availableCourses.find(c => c.id === courseIdNum);
    if (course) {
      append({
        id: course.id,
        courseName: course.courseName,
        credits: course.credits,
        description: course.description
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-3 pl-4 border-l-2 border-primary/20 mt-4">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em] text-left block">Daftar Mata Kuliah</label>
        <Button 
          type="button" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-7 text-[8px] font-black uppercase bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3"
        >
          <Plus className="w-3 h-3 mr-1" /> Tambah MK
        </Button>
      </div>

      {/* Course Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 bg-primary/5 border-b border-primary/10 text-left">
            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">Pilih Mata Kuliah</DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500 mt-1">
              Cari dan pilih mata kuliah untuk ditambahkan ke kategori ini.
            </DialogDescription>
          </div>
          
          <Command className="rounded-none border-none">
            <CommandInput placeholder="Cari berdasarkan nama mata kuliah..." className="h-14 px-6 text-sm font-bold" />
            <CommandList className="max-h-[350px] p-2">
              <CommandEmpty className="py-10 text-sm italic font-medium text-gray-400">Mata kuliah tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {availableCourses.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.courseName}
                    onSelect={() => handleAddNewCourse(c.id.toString())}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:text-primary transition-all">
                      <BookMarked className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold text-gray-700 truncate">{c.courseName}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{c.credits} SKS</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {fields.map((lecture, lectureIndex) => (
          <div key={lecture.id} className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group/item transition-all hover:shadow-md">
             <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(lectureIndex)}
                className="absolute top-2 right-2 h-6 w-6 text-red-500 opacity-0 group-hover/item:opacity-100 transition-all z-10"
             >
                <Trash2 className="w-3 h-3" />
             </Button>

             <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                <div className="sm:col-span-3 space-y-1">
                   <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Pilih Mata Kuliah</label>
                    <CoursePicker 
                      availableCourses={availableCourses}
                      selectedId={watchedCourses?.[lectureIndex]?.id}
                      onSelect={(courseId) => handleCourseSelection(lectureIndex, courseId)}
                    />
                </div>
                <div className="space-y-1">
                   <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">SKS Terdaftar</label>
                   <div className="h-10 flex items-center px-4 bg-primary/5 rounded-xl font-black text-sm text-primary">
                      {watchedCourses?.[lectureIndex]?.credits || 0}
                   </div>
                </div>
             </div>
             
             {watchedCourses?.[lectureIndex]?.description && (
                <p className="text-[10px] font-medium text-gray-400 bg-gray-50 p-3 rounded-xl line-clamp-2 italic text-left">
                   {watchedCourses[lectureIndex].description}
                </p>
             )}
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

interface CoursePickerProps {
  availableCourses: any[];
  selectedId: number | undefined;
  onSelect: (courseId: string) => void;
}

function CoursePicker({ availableCourses, selectedId, onSelect }: CoursePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-10 px-4 rounded-xl border-none bg-gray-50/50 font-bold text-xs justify-between transition-all hover:bg-gray-100/80",
            !selectedId && "text-muted-foreground"
          )}
        >
          {selectedId
            ? availableCourses.find((c) => c.id === selectedId)?.courseName
            : "Pilih Mata Kuliah..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari mata kuliah..." className="h-9" />
          <CommandList>
            <CommandEmpty>Mata kuliah tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {availableCourses.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.courseName}
                  onSelect={() => {
                    onSelect(c.id.toString());
                    setOpen(false);
                  }}
                  className="text-xs font-semibold py-3"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === c.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{c.courseName}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{c.credits} SKS</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
