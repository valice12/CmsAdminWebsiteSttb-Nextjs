"use client";

import { getImageUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getNewsById, addNews, editNews, deleteNews, getAllNewsCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, Image as ImageIcon, Tag, Globe, FileText, Calendar, Upload } from 'lucide-react';
import { toast } from 'sonner';

const newsSchema = z.object({
  slug: z.string().min(3, 'Slug minimal 3 karakter'),
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  isPublished: z.boolean(),
  publishDate: z.string(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface BeritaFormProps {
  id?: string;
}

export function BeritaForm({ id }: BeritaFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  const [categories, setCategories] = useState<string[]>([]);
  const [news, setNews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getAllNewsCategories();
        setCategories(data.items || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Gagal mengambil daftar kategori');
      }
    }
    loadCategories();
  }, []);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      category: '',
      isPublished: false,
      publishDate: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        loadNews(numericId);
      } else {
        toast.error('ID Berita tidak valid');
        router.push('/admin/berita');
      }
    }
  }, [id, isEdit, router]);

  const loadNews = async (newsId: number) => {
    if (isNaN(newsId)) return;
    try {
      const news = await getNewsById(newsId);
      if (news) {
        form.reset({
          slug: news.slug,
          title: news.title,
          content: news.content,
          category: news.category?.[0] || '',
          isPublished: news.isPublished,
          publishDate: new Date(news.publishedAt || new Date()).toISOString().slice(0, 16),
        });
        if (news.thumbnailPath) {
          setPreviewUrl(getImageUrl(news.thumbnailPath, 'news'));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data berita');
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      const formData = new FormData();
      if (isEdit && id) formData.append('Id', id);
      formData.append('Slug', data.slug);
      formData.append('Title', data.title);
      formData.append('Content', data.content);
      formData.append('PublicationDate', new Date(data.publishDate).toISOString());
      formData.append('IsPublished', data.isPublished.toString());
      formData.append('Category', data.category);
      
      if (selectedFile) {
        formData.append('NewsImage', selectedFile);
      }

      if (isEdit && id) {
        await editNews(formData);
        toast.success('Berita berhasil diperbarui');
      } else {
        await addNews(formData);
        toast.success('Berita berhasil ditambahkan');
      }

      router.push('/admin/berita');
      router.refresh();
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui berita' : 'Gagal menambahkan berita');
      console.error(error);
    }
  };

  const onInvalid = (errors: any) => {
    console.dir(errors);
    toast.error('Penyimpanan gagal. Harap lengkapi semua bidang yang wajib diisi.');
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
            onClick={() => router.push('/admin/berita')}
            className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Berita' : 'Buat Berita Baru'}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {isEdit ? 'Perbarui konten berita yang sudah ada.' : 'Publikasikan berita atau pengumuman baru untuk institusi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Judul Utama Berita</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...form.register('title')}
                    placeholder="Masukkan judul berita..."
                    className={`pl-12 h-14 rounded-2xl text-lg font-bold transition-all shadow-inner border-2 ${
                      form.formState.errors.title 
                      ? 'border-red-500 bg-red-50/50' 
                      : 'bg-gray-50/50 border-transparent focus:bg-white'
                    }`}
                  />
                </div>
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500 font-bold ml-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em] ml-1">Slug URL</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...form.register('slug')}
                    placeholder="judul-berita-anda"
                    className={`pl-12 h-14 rounded-2xl text-base font-bold transition-all shadow-inner border-2 ${
                      form.formState.errors.slug 
                      ? 'border-red-500 bg-red-50/50 text-red-900' 
                      : 'bg-gray-50/50 border-transparent focus:bg-white text-gray-500'
                    }`}
                  />
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs text-red-500 font-bold ml-1">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* Content Editor Placeholder */}
            <div className="space-y-2">
              <div className={`relative rounded-2xl overflow-hidden transition-all shadow-inner border-2 ${
                form.formState.errors.content 
                ? 'border-red-500 bg-red-50/50' 
                : 'border-transparent bg-gray-50/50 focus-within:bg-white'
              }`}>
                <Textarea
                  {...form.register('content')}
                  placeholder="Tuliskan berita lengkap di sini..."
                  rows={20}
                  className="font-medium text-gray-700 p-6 border-none focus-visible:ring-0 resize-none leading-relaxed bg-transparent"
                />
              </div>
              {form.formState.errors.content && (
                <p className="text-xs text-red-500 font-bold ml-1 uppercase tracking-wider">
                  {form.formState.errors.content.message}
                </p>
              )}
              <div className="bg-blue-50/50 p-4 rounded-xl flex items-start gap-3 mt-4 border border-blue-100/50">
                  <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-[11px] text-blue-700 font-medium">
                     <span className="font-bold">Pro-tip:</span> Anda dapat menggunakan tag HTML standar seperti <b>&lt;p&gt;</b>, <b>&lt;h2&gt;</b>, dan <b>&lt;strong&gt;</b> untuk memformat tampilan konten di portal utama.
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#0B1B3D] rounded-[2rem] p-8 text-white shadow-2xl shadow-navy/30 space-y-8 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <h3 className="text-sm font-extrabold uppercase tracking-[0.3em] text-[#D4AF37] flex items-center gap-2">
               <Globe className="w-4 h-4" /> Publikasi
            </h3>

            {/* Status Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Visibilitas Konten</label>
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

            {/* DateTime Picker */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Jadwal Tayang</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="datetime-local"
                  {...form.register('publishDate')}
                  className="bg-white/5 border-white/10 text-white rounded-xl h-11 pl-11 text-xs font-medium focus:bg-white/10 transition-all border-none"
                />
              </div>
            </div>
          </div>

            {/* Category Select - Fixed alignment with backend (reads single Category) */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Berita</label>
              <select
                {...form.register('category')}
                className="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700 appearance-none focus-visible:outline-none focus:bg-white transition-all cursor-pointer"
              >
                <option value="" className="font-bold">Pilih Kategori...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id || cat} value={cat.categoryName || cat} className="font-bold">
                    {cat.categoryName || cat}
                  </option>
                ))}
              </select>
              {form.formState.errors.category && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

          {/* Media Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6 text-left">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
               <ImageIcon className="w-4 h-4" /> Media Utama
            </h3>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Gambar Sampul</label>
              <div className="relative group border-2 border-dashed border-gray-100 rounded-2xl p-4 transition-all hover:border-primary/50 bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2 py-4">
                   <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Pilih File Gambar</p>
                </div>
              </div>
            </div>

            {/* Improved Preview */}
            <div className="group relative rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                   <ImageIcon className="w-10 h-10" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">No Selection</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Sticky Success Action */}
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 sticky bottom-8 z-10">
            <Button
              type="submit"
              isLoading={form.formState.isSubmitting}
              className="w-full h-14 rounded-2xl bg-[#D4AF37] hover:bg-[#C19B2E] text-white font-extrabold text-sm uppercase tracking-[0.1em] shadow-lg shadow-gold/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/berita')}
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
