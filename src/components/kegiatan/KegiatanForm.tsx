"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getImageUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getEventById, addEvent, editEvent, getAllEventCategories } from '@/lib/api';
import { Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Calendar, MapPin, Globe, Building, Image as ImageIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

const eventSchema = z.object({
  slug: z.string().min(3, 'Slug minimal 3 karakter'),
  eventTitle: z.string().min(5, 'Nama event minimal 5 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  organizerName: z.string().min(3, 'Nama penyelenggara wajib diisi'),
  location: z.string().min(3, 'Lokasi wajib diisi'),
  startsAtDate: z.string(),
  endsAtDate: z.string(),
  category: z.string().min(1, 'Kategori wajib diisi'),
  isPublished: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface KegiatanFormProps {
  id?: string;
}

export function KegiatanForm({ id }: KegiatanFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getAllEventCategories();
        setCategories(data.items || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    loadCategories();
  }, []);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      slug: '',
      eventTitle: '',
      description: '',
      organizerName: '',
      location: '',
      startsAtDate: new Date().toISOString().slice(0, 16),
      endsAtDate: new Date().toISOString().slice(0, 16),
      category: 'Umum',
      isPublished: false,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        loadEvent(numericId);
      } else {
        toast.error('ID Kegiatan tidak valid');
        router.push('/admin/kegiatan');
      }
    }
  }, [id, isEdit, router]);

  const loadEvent = async (eventId: number) => {
    if (isNaN(eventId)) return;
    try {
      const event = await getEventById(eventId);
      if (event) {
        form.reset({
          slug: event.slug,
          eventTitle: event.eventTitle,
          description: event.description,
          organizerName: event.organizerName,
          location: event.location,
          startsAtDate: new Date(event.startsAtDate || new Date()).toISOString().slice(0, 16),
          endsAtDate: new Date(event.endsAtDate || new Date()).toISOString().slice(0, 16),
          category: event.category?.[0] || 'Umum',
          isPublished: event.isPublished,
        });
        if (event.imagePath) {
          setPreviewUrl(getImageUrl(event.imagePath, 'events'));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data event');
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const formData = new FormData();
      if (isEdit && id) formData.append('Id', id);
      formData.append('Slug', data.slug);
      formData.append('EventTitle', data.eventTitle);
      formData.append('Description', data.description);
      formData.append('Location', data.location);
      formData.append('StartsAtDate', new Date(data.startsAtDate).toISOString());
      formData.append('EndsAtDate', new Date(data.endsAtDate).toISOString());
      formData.append('OrganizerName', data.organizerName);
      formData.append('Category', data.category);
      formData.append('IsPublished', data.isPublished.toString());

      if (selectedFile) {
        formData.append('EventImage', selectedFile);
      }

      if (isEdit && id) {
        await editEvent(formData);
        toast.success('Event berhasil diperbarui');
      } else {
        await addEvent(formData);
        toast.success('Event berhasil ditambahkan');
      }

      router.push('/admin/kegiatan');
      router.refresh();
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui event' : 'Gagal menambahkan event');
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/admin/kegiatan')}
            className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Kegiatan' : 'Buat Agenda Baru'}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {isEdit ? 'Perbarui informasi detail kegiatan kampus.' : 'Daftarkan agenda kegiatan atau seminar baru untuk komunitas.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           {/* Detailed Information */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Nama Kegiatan</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...form.register('eventTitle')}
                    placeholder="Masukkan nama kegiatan..."
                    className="pl-12 h-14 bg-gray-50/50 border-gray-100 rounded-2xl text-lg font-bold focus:bg-white transition-all shadow-inner border-none"
                  />
                </div>
                {form.formState.errors?.eventTitle && (
                  <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.eventTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Slug URL</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...form.register('slug')}
                    placeholder="nama-kegiatan-kampus"
                    className="pl-12 h-14 bg-gray-50/50 border-gray-100 rounded-2xl text-base font-bold text-gray-500 focus:bg-white transition-all shadow-inner border-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Deskripsi Kegiatan</label>
              <div className="relative rounded-2xl overflow-hidden border border-gray-50 bg-gray-50/50 focus-within:bg-white transition-all shadow-inner">
                <Textarea
                  {...form.register('description')}
                  placeholder="Jelaskan mengenai kegiatan ini, tujuan, dan detail lainnya..."
                  rows={8}
                  className="font-medium text-gray-700 p-6 border-none focus-visible:ring-0 resize-none leading-relaxed"
                />
              </div>
              {form.formState.errors?.description && (
                <p className="text-xs text-red-500 font-bold ml-1 uppercase tracking-wider">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Penyelenggara / Unit</label>
                   <div className="relative group">
                     <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                     <Input
                       {...form.register('organizerName')}
                       placeholder="e.g. BEM STTB"
                       className="pl-12 h-12 bg-gray-50/50 border-gray-100 rounded-xl text-sm font-bold focus:bg-white transition-all shadow-inner border-none"
                     />
                   </div>
                   {form.formState.errors?.organizerName && (
                     <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.organizerName.message}</p>
                   )}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Waktu Mulai</label>
                     <div className="relative">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <Input
                         type="datetime-local"
                         {...form.register('startsAtDate')}
                         className="pl-12 h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold text-gray-700 shadow-inner"
                       />
                     </div>
                   </div>
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Waktu Selesai</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="datetime-local"
                          {...form.register('endsAtDate')}
                          className="pl-12 h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold text-gray-700 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
 
        {/* Sidebar */}
        <div className="space-y-6">
           {/* Logistics Card */}
          <div className="bg-[#0B1B3D] rounded-[2rem] p-8 text-white shadow-2xl shadow-navy/30 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <h3 className="text-sm font-extrabold uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
               <MapPin className="w-4 h-4" /> Logistik
            </h3>

            {/* Status Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status Agenda</label>
              <div className="grid grid-cols-2 gap-2">
                  <button 
                     type="button"
                     onClick={() => form.setValue('isPublished', false)}
                     className={`flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold transition-all border ${
                        !form.watch('isPublished') 
                        ? 'bg-[#1E3A5F] border-[#D4AF37]/50 text-[#D4AF37]' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                     }`}
                  >
                     Draft
                  </button>
                  <button 
                     type="button"
                     onClick={() => form.setValue('isPublished', true)}
                     className={`flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold transition-all border ${
                        form.watch('isPublished') 
                        ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                     }`}
                  >
                     Publish
                  </button>
              </div>
            </div>

            {/* Category Select - Aligned with backend */}
            <div className="space-y-3 pb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Kategori Event</label>
              <select
                {...form.register('category')}
                className="w-full h-11 rounded-xl border border-white/10 bg-white/5 text-white px-4 text-xs font-bold focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0B1B3D]">Pilih Kategori...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0B1B3D] text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* Location Type Picker Removed as Backend uses single Location string */}

            {/* Location Input */}
            <div className="space-y-2">
              <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input
                   {...form.register('location')}
                   placeholder="e.g. Ruang Aula Utama atau Link Zoom"
                   className="bg-white/5 border-none text-white rounded-xl h-11 pl-11 text-xs font-medium focus:bg-white/10 transition-all"
                 />
              </div>
              {form.formState.errors?.location && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Media/Poster Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
               <ImageIcon className="w-4 h-4" /> Poster Event
            </h3>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Poster Event</label>
              <div className="relative group border-2 border-dashed border-gray-100 rounded-2xl p-4 transition-all hover:border-primary/50 bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2 py-4">
                   <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest text-center">Pilih Banner / Poster</p>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="group relative rounded-2xl overflow-hidden border border-gray-100 aspect-[3/4] bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl || ''}
                  alt="Poster preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                   <ImageIcon className="w-10 h-10" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">No Poster Selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Sticky */}
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 sticky bottom-8 z-10">
            <Button 
               type="submit" 
               isLoading={form.formState.isSubmitting} 
               className="w-full h-14 rounded-2xl bg-[#D4AF37] hover:bg-[#C19B2E] text-white font-extrabold text-sm uppercase tracking-[0.1em] shadow-lg shadow-gold/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Simpan Pembaruan' : 'Terbitkan Agenda'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/kegiatan')}
              className="w-full h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 border-none"
            >
              Batalkan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
