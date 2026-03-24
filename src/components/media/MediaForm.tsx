"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    getJournalById, 
    getArticleById, 
    getVideoById, 
    getMonografById, 
    addMedia, 
    editMedia 
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    ArrowLeft, Save, FileText, MonitorPlay, BookOpen, 
    Newspaper, Layers, Upload, Globe, User, Calendar, 
    Image as ImageIcon, Link as LinkIcon, FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

const mediaSchema = z.object({
  slug: z.string().min(3, 'Slug minimal 3 karakter'),
  mediaTitle: z.string().min(5, 'Judul minimal 5 karakter'),
  mediaDescription: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  authors: z.string().min(3, 'Penulis wajib diisi'),
  publicationDate: z.string(),
  category: z.string().min(1, 'Kategori wajib diisi'),
  videoUrl: z.string().optional(),
  // For file uploads we'll use state
});

type MediaFormData = z.infer<typeof mediaSchema>;

interface MediaFormProps {
  id?: string;
}

export function MediaForm({ id }: MediaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatParam = searchParams.get('format') || 'artikel';
  
  const isEdit = !!id;
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState(formatParam);

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      slug: '',
      mediaTitle: '',
      mediaDescription: '',
      authors: '',
      publicationDate: new Date().toISOString().slice(0, 10),
      category: 'General',
      videoUrl: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadMedia(parseInt(id));
    }
  }, [id, isEdit, activeFormat]);

  const loadMedia = async (mediaId: number) => {
    try {
      let data;
      switch (activeFormat) {
        case 'artikel': data = await getArticleById(mediaId); break;
        case 'video': data = await getVideoById(mediaId); break;
        case 'journal': data = await getJournalById(mediaId); break;
        case 'monograf': data = await getMonografById(mediaId); break;
        case 'buletin': data = await getJournalById(mediaId); break; // Assuming buletin uses journal model or similar
        default: data = await getArticleById(mediaId);
      }

      if (data) {
        form.reset({
          slug: data.slug,
          mediaTitle: data.mediaTitle,
          mediaDescription: data.mediaDescription,
          authors: data.authors?.map((a: any) => a.fullName).join(', ') || '',
          publicationDate: new Date(data.publicationDate || new Date()).toISOString().slice(0, 10),
          category: data.category?.[0] || 'General',
          videoUrl: data.videoUrl || '',
        });
        if (data.thumbnailPath) {
          setPreviewUrl(getImageUrl(data.thumbnailPath, activeFormat));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat detail media');
    }
  };

  const onSubmit = async (data: MediaFormData) => {
    try {
      const formData = new FormData();
      formData.append('Slug', data.slug);
      formData.append('MediaTitle', data.mediaTitle);
      formData.append('MediaDescription', data.mediaDescription);
      formData.append('Authors', data.authors);
      formData.append('PublicationDate', new Date(data.publicationDate).toISOString());
      formData.append('Category', data.category);
      formData.append('MediaFormat', activeFormat);

      if (activeFormat === 'video' && data.videoUrl) {
          formData.append('VideoUrl', data.videoUrl);
      }

      if (selectedThumbnail) {
        formData.append('Thumbnail', selectedThumbnail);
      }

      if (selectedFile) {
        // Map to correct field based on backend controller (PdfFile, etc)
        const fileField = activeFormat === 'artikel' ? 'MainText' : 
                         activeFormat === 'video' ? 'VideoFile' : 'PdfFile';
        formData.append(fileField, selectedFile);
      }

      const type = activeFormat === 'artikel' ? 'article' : 
                   activeFormat === 'video' ? 'video' : 
                   activeFormat === 'journal' ? 'journal' :
                   activeFormat === 'monograf' ? 'monograf' : 'buletin';

      if (isEdit && id) {
        await editMedia(type, parseInt(id), formData);
        toast.success(`${activeFormat} berhasil diperbarui`);
      } else {
        await addMedia(type, formData);
        toast.success(`${activeFormat} berhasil ditambahkan`);
      }

      router.push('/admin/media');
      router.refresh();
    } catch (error) {
      toast.error(`Gagal menyimpan ${activeFormat}`);
      console.error(error);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'artikel': return <FileText className="w-5 h-5" />;
      case 'video': return <MonitorPlay className="w-5 h-5" />;
      case 'journal': return <BookOpen className="w-5 h-5" />;
      case 'buletin': return <Newspaper className="w-5 h-5" />;
      case 'monograf': return <Layers className="w-5 h-5" />;
      default: return <ImageIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/media')} className="h-10 w-10 rounded-full hover:bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              {getFormatIcon(activeFormat)}
              {isEdit ? `Edit ${activeFormat}` : `Upload ${activeFormat} Baru`}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {isEdit ? 'Perbarui metadata dan file konten media.' : 'Tambahkan konten baru ke pustaka media digital.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Media</label>
                <div className="relative group">
                  <Input {...form.register('mediaTitle')} placeholder="Judul konten..." className="h-14 bg-gray-50/50 border-none rounded-2xl text-base font-bold shadow-inner focus:bg-white transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Slug URL</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <Input {...form.register('slug')} placeholder="slug-konten" className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl text-sm font-bold shadow-inner" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan / Abstrak</label>
              <Textarea {...form.register('mediaDescription')} rows={6} className="rounded-3xl bg-gray-50/50 border-none shadow-inner p-6 text-sm font-medium leading-relaxed" placeholder="Tuliskan deskripsi singkat mengenai konten ini..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penulis / Kontributor</label>
                   <div className="relative group">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                     <Input {...form.register('authors')} placeholder="Nama lengkap penulis..." className="pl-12 h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold shadow-inner" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Publikasi</label>
                   <div className="relative group">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                     <Input type="date" {...form.register('publicationDate')} className="pl-12 h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold shadow-inner" />
                   </div>
                </div>
            </div>

            {activeFormat === 'video' && (
              <div className="space-y-2 pt-4 border-t border-gray-50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Video (YouTube/Vimeo)</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input {...form.register('videoUrl')} placeholder="https://youtube.com/watch?v=..." className="pl-12 h-12 bg-blue-50/30 border-none rounded-xl text-xs font-bold text-primary shadow-inner" />
                </div>
              </div>
            )}

            {(activeFormat !== 'video') && (
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File Dokumen (PDF/DOCX)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center gap-4 bg-gray-50/30 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer relative">
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <FileUp className="w-10 h-10 text-gray-300" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter text-center">
                        {selectedFile ? selectedFile.name : 'Klik atau seret file ke sini untuk upload'}
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0B1B3D] rounded-[2.5rem] p-8 text-white shadow-2xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Thumbnail Media</h3>
            <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group cursor-pointer">
              <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {previewUrl ? (
                <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <Upload className="w-8 h-8" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Select Thumbnail</p>
                </div>
              )}
            </div>
            <div className="space-y-3 pt-4">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Media</label>
               <select {...form.register('category')} className="w-full h-11 rounded-xl bg-white/5 border-none text-white px-4 text-xs font-bold appearance-none">
                  <option value="General" className="bg-[#0B1B3D]">General</option>
                  <option value="Academic" className="bg-[#0B1B3D]">Academic</option>
                  <option value="Tutorial" className="bg-[#0B1B3D]">Tutorial</option>
               </select>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3 sticky bottom-8">
            <Button type="submit" isLoading={form.formState.isSubmitting} className="w-full h-14 rounded-2xl bg-[#D4AF37] hover:bg-[#C19B2E] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-gold/20">
              <Save className="w-5 h-5 mr-3" />
              {isEdit ? 'Simpan Perubahan' : 'Publish Media'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/media')} className="w-full h-12 rounded-2xl font-bold text-gray-400 hover:text-gray-600">
              Batalkan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
