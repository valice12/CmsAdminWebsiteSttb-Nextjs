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
  getBuletinById,
  addMedia,
  editMedia,
  getAllMediaCategories
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Save, FileText, MonitorPlay, BookOpen,
  Newspaper, Layers, Upload, User, Calendar,
  Image as ImageIcon, Link as LinkIcon, FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/utils';

const mediaSchema = z.object({
  mediaTitle: z.string().min(5, 'Judul minimal 5 karakter'),
  mediaDescription: z.string().optional(),
  mediaContent: z.string().optional(),
  authors: z.string().min(3, 'Penulis wajib diisi'),
  publicationDate: z.string(),
  category: z.string().min(1, 'Kategori wajib diisi'),
  isPublished: z.boolean(),
  videoUrl: z.string().optional(),
  // Monograf specific
  price: z.string().optional(),
  isbn: z.string().optional(),
  contact: z.string().optional(),
  issn: z.string().optional(),
  eissn: z.string().optional(),
  doi: z.string().optional(),
  abstract: z.string().optional(),
  // For validation logic
  format: z.string().optional(),
}).superRefine((data, ctx) => {
  // Exception for Journal: Description is not required, but Abstract is
  if (data.format === 'journal') {
    if (!data.abstract || data.abstract.trim().length < 10) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'Abstrak wajib diisi minimal 10 karakter untuk Jurnal', 
        path: ['abstract'] 
      });
    }
    if (!data.issn || data.issn.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ISSN wajib diisi untuk Jurnal', path: ['issn'] });
    }
    if (!data.eissn || data.eissn.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-ISSN wajib diisi untuk Jurnal', path: ['eissn'] });
    }
    if (!data.doi || data.doi.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'DOI wajib diisi untuk Jurnal', path: ['doi'] });
    }
  } else {
    // For other formats (except Monograf), mediaDescription is mandatory
    if (data.format !== 'monograf' && (!data.mediaDescription || data.mediaDescription.trim().length < 10)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'Ringkasan/Sinopsis wajib diisi minimal 10 karakter', 
        path: ['mediaDescription'] 
      });
    }
  }
});

type MediaFormData = z.infer<typeof mediaSchema>;

interface MediaFormProps {
  id?: string;
}

export function MediaForm({ id }: MediaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formatParam = searchParams.get('format');
  const initialFormat = (formatParam || 'video').toLowerCase();

  const isEdit = !!id;
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Normalize format: article, video, journal, monograf, buletin
  const [activeFormat, setActiveFormat] = useState(initialFormat === 'artikel' ? 'article' : initialFormat);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllMediaCategories(1, 10, true);
        // Backend returns: { categories: [ { id, categoryName, ... }, ... ] }
        const rawList = data.categories || data.items || (Array.isArray(data) ? data : []);
        const catList = rawList.map((c: any) => typeof c === 'string' ? c : (c.categoryName || c.CategoryName || c.name || c.Name));
        setCategories(catList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      mediaTitle: '',
      mediaDescription: '',
      mediaContent: '',
      authors: '',
      publicationDate: new Date().toISOString().slice(0, 10),
      category: '',
      isPublished: true,
      videoUrl: '',
      price: '',
      isbn: '',
      contact: '',
      issn: '',
      eissn: '',
      doi: '',
      abstract: '',
      format: initialFormat,
    },
  });

  useEffect(() => {
    form.setValue('format', activeFormat);
    if (isEdit && id) {
      loadMedia(parseInt(id));
    }
  }, [id, isEdit, activeFormat]);

  const loadMedia = async (mediaId: number) => {
    try {
      let data;
      switch (activeFormat) {
        case 'artikel':
        case 'article': data = await getArticleById(mediaId); break;
        case 'video': data = await getVideoById(mediaId); break;
        case 'journal': data = await getJournalById(mediaId); break;
        case 'monograf': data = await getMonografById(mediaId); break;
        case 'buletin': data = await getBuletinById(mediaId); break;
        default: data = await getArticleById(mediaId);
      }

      if (data) {
        // Map format-specific backend properties to frontend generic fields
        const mappedTitle =
          data.videoTitle ||
          data.articleTitle ||
          data.journalTitle ||
          data.monografTitle ||
          data.buletinTitle || '';

        const mappedDescription =
          data.videoDescription ||
          data.articleContent ||
          data.articleDescription ||
          data.synopsis ||
          data.description || '';

        form.reset({
          mediaTitle: mappedTitle,
          mediaDescription: data.articleDescription || data.synopsis || data.description || mappedDescription.substring(0, 200),
          mediaContent: data.articleContent || mappedDescription,
          authors: data.authors?.map((a: any) => a.authorName || a.fullName).join(', ') || '',
          publicationDate: new Date(data.publicationDate || new Date()).toISOString().slice(0, 10),
          category: Array.isArray(data.category) ? data.category.join(', ') : (typeof data.category === 'string' ? data.category : 'General'),
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          videoUrl: data.videoUrl || '',
          price: data.price?.toString() || '0',
          isbn: data.isbn || '',
          contact: data.contact || '',
          issn: data.issn || '',
          eissn: data.eIssn || data.eissn || '',
          doi: data.doi || '',
          abstract: data.abstract || '',
          format: activeFormat,
        });
        if (data.thumbnailPath) {
          setPreviewUrl(getImageUrl(data.thumbnailPath, activeFormat));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat detail media');
      console.error(error);
    }
  };

  const onSubmit = async (data: MediaFormData) => {
    try {
      const formData = new FormData();

      // 1. Title handling
      if (activeFormat === 'video') {
        formData.append('VideoTitle', data.mediaTitle);
      } else if (activeFormat === 'article' || activeFormat === 'artikel') {
        formData.append('ArticleTitle', data.mediaTitle);
      } else if (activeFormat === 'journal') {
        formData.append('JournalTitle', data.mediaTitle);
      } else if (activeFormat === 'monograf') {
        formData.append('MonografTitle', data.mediaTitle);
      } else if (activeFormat === 'buletin') {
        formData.append('BuletinTitle', data.mediaTitle);
      }

      // 2. Description/Content/Summary
      if (activeFormat === 'article' || activeFormat === 'artikel') {
        formData.append('ArticleDescription', data.mediaDescription || '');
        formData.append('ArticleContent', data.mediaContent || data.mediaDescription || '');
      } else if (activeFormat === 'video') {
        formData.append('VideoDescription', data.mediaDescription || '');
      } else if (activeFormat === 'monograf') {
        formData.append('Synopsis', data.mediaDescription || '');
      } else if (activeFormat === 'buletin') {
        formData.append('Description', data.mediaDescription || '');
      }

      // 3. Categories (Standard multiple keys for primitive lists)
      const categories = data.category.split(',').map(s => s.trim()).filter(s => s.length > 0);
      categories.forEach((cat) => {
        formData.append('Category', cat);
      });

      // 4. Authors (Dot notation for complex types)
      const authorNames = data.authors.split(',').map(s => s.trim()).filter(s => s.length > 0);
      authorNames.forEach((name, index) => {
        formData.append(`Authors[${index}].AuthorName`, name);
        formData.append(`Authors[${index}].AuthorPosition`, 'Contributor');
      });

      // 5. Shared fields
      const isoDate = data.publicationDate ? new Date(data.publicationDate).toISOString() : new Date().toISOString();
      formData.append('PublicationDate', isoDate);
      formData.append('IsPublished', data.isPublished.toString());

      if (isEdit && id) {
        formData.append('Id', id.toString());
      }

      // DEBUG LOGGING
      console.log('--- SUBMITTING MEDIA FORM ---');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value instanceof File ? `File(${value.name})` : value}`);
      });

      // 6. Format-specific extras
      if (activeFormat === 'video') {
        formData.append('VideoUrl', data.videoUrl || '');
      } else if (activeFormat === 'journal') {
        formData.append('Issn', data.issn || '');
        formData.append('EIssn', data.eissn || '');
        formData.append('Doi', data.doi || '');
        formData.append('Abstract', data.abstract || '');
      } else if (activeFormat === 'monograf') {
        formData.append('Price', data.price || '0');
        formData.append('ISBN', data.isbn || '');
        formData.append('Contact', data.contact || '');
      }

      // 7. Thumbnail
      if (selectedThumbnail) {
        formData.append('Thumbnail', selectedThumbnail);
      }

      // 8. Files
      if (selectedFile) {
        if (activeFormat === 'journal') {
          formData.append('JournalFile', selectedFile);
        } else if (activeFormat === 'buletin') {
          formData.append('BuletinFile', selectedFile);
        } else if (activeFormat !== 'article' && activeFormat !== 'artikel' && activeFormat !== 'video' && activeFormat !== 'monograf') {
          formData.append('PdfFile', selectedFile);
        }
      }

      const type = (activeFormat === 'artikel' || activeFormat === 'article') ? 'article' :
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

  const onInvalid = (errors: any) => {
    console.dir(errors);
    toast.error('Penyimpanan gagal. Harap lengkapi semua bidang yang wajib diisi.');
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

      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
            {!isEdit && (
              <div className="space-y-2 border-b border-gray-50 pb-8">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Format Konten Baru</label>
                <select
                  value={activeFormat === 'artikel' ? 'article' : activeFormat}
                  onChange={(e) => {
                    setActiveFormat(e.target.value);
                    form.reset();
                  }}
                  className="w-full h-14 bg-blue-50/30 text-primary border-none rounded-2xl text-sm font-bold shadow-inner focus:bg-white transition-all px-4 outline-none cursor-pointer"
                >
                  <option value="article">Artikel Teks</option>
                  <option value="video">Video Konten</option>
                  <option value="journal">Jurnal Ilmiah</option>
                  <option value="monograf">Buku & Monograf</option>
                  <option value="buletin">Buletin Kampus</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Media</label>
                <div className="relative group">
                  <Input 
                    {...form.register('mediaTitle')} 
                    placeholder="Judul konten..." 
                    className={`h-14 rounded-2xl text-base font-bold shadow-inner transition-all border-2 ${
                      form.formState.errors.mediaTitle 
                      ? 'border-red-500 bg-red-50/50' 
                      : 'bg-gray-50/50 border-transparent focus:bg-white'
                    }`} 
                  />
                </div>
                {form.formState.errors.mediaTitle && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 italic">{form.formState.errors.mediaTitle.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Publikasi</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <Input type="date" {...form.register('publicationDate')} className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl text-sm font-bold shadow-inner" />
                </div>
              </div>
            </div>
            
            {activeFormat === 'journal' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Abstrak Jurnal</label>
                <Textarea 
                  {...form.register('abstract')} 
                  rows={6} 
                  className={`rounded-2xl bg-blue-50/30 border-2 shadow-inner p-4 text-sm font-medium leading-relaxed transition-all ${
                    form.formState.errors.abstract 
                    ? 'border-red-500 bg-red-50/50' 
                    : 'border-transparent'
                  }`} 
                  placeholder="Tuliskan abstrak jurnal ilmiah di sini..." 
                />
                {form.formState.errors.abstract && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 italic">{form.formState.errors.abstract.message}</p>
                )}
              </div>
            )}
            {activeFormat !== 'journal' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {(activeFormat === 'article' || activeFormat === 'artikel') ? 'Ringkasan / Abstrak' : 'Keterangan / Sinopsis'}
                </label>
                <Textarea 
                  {...form.register('mediaDescription')} 
                  rows={3} 
                  className={`rounded-3xl p-6 text-sm font-medium leading-relaxed shadow-inner transition-all border-2 ${
                    form.formState.errors.mediaDescription 
                    ? 'border-red-500 bg-red-50/50' 
                    : 'bg-gray-50/50 border-transparent focus:bg-white'
                  }`} 
                  placeholder="Tuliskan ringkasan singkat..." 
                />
                {form.formState.errors.mediaDescription && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 italic">{form.formState.errors.mediaDescription.message}</p>
                )}
              </div>
            )}

            {(activeFormat === 'article' || activeFormat === 'artikel') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Isi Lengkap Artikel</label>
                <Textarea 
                  {...form.register('mediaContent')} 
                  rows={12} 
                  className={`rounded-[2rem] shadow-inner p-8 text-sm font-medium leading-relaxed min-h-[300px] transition-all border-2 ${
                    form.formState.errors.mediaContent 
                    ? 'border-red-500 bg-red-50/50' 
                    : 'bg-gray-50/50 border-transparent focus:bg-white'
                  }`} 
                  placeholder="Tuliskan isi artikel selengkapnya di sini..." 
                />
                {form.formState.errors.mediaContent && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 italic">{form.formState.errors.mediaContent.message}</p>
                )}
              </div>
            )}
            {(activeFormat === 'monograf') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Harga (Buku/Monograf)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                    <Input type="number" {...form.register('price')} placeholder="0" className="pl-10 h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor ISBN</label>
                  <Input {...form.register('isbn')} placeholder="978-..." className="h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold shadow-inner px-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kontak Pemesanan</label>
                  <Input {...form.register('contact')} placeholder="WA: 08..." className="h-12 bg-gray-50/50 border-none rounded-xl text-sm font-bold shadow-inner px-4" />
                </div>
              </div>
            )}

            {(activeFormat === 'journal') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor ISSN</label>
                  <Input {...form.register('issn')} placeholder="ISSN..." className="h-12 bg-blue-50/30 border-none rounded-xl text-sm font-bold shadow-inner px-4" />
                  {form.formState.errors.issn && <p className="text-[10px] text-red-500 mt-1">{form.formState.errors.issn.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor E-ISSN</label>
                  <Input {...form.register('eissn')} placeholder="E-ISSN..." className="h-12 bg-blue-50/30 border-none rounded-xl text-sm font-bold shadow-inner px-4" />
                  {form.formState.errors.eissn && <p className="text-[10px] text-red-500 mt-1">{form.formState.errors.eissn.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor DOI</label>
                  <Input {...form.register('doi')} placeholder="DOI..." className="h-12 bg-blue-50/30 border-none rounded-xl text-sm font-bold shadow-inner px-4" />
                  {form.formState.errors.doi && <p className="text-[10px] text-red-500 mt-1">{form.formState.errors.doi.message}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penulis / Kontributor <span className="text-gray-300 normal-case font-normal">(pisahkan dengan koma)</span></label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <Input 
                  {...form.register('authors')} 
                  placeholder="John Doe, Jane Smith..." 
                  className={`pl-12 h-12 rounded-xl text-sm font-bold shadow-inner border-2 transition-all ${
                    form.formState.errors.authors 
                    ? 'border-red-500 bg-red-50/50' 
                    : 'bg-gray-50/50 border-transparent focus:bg-white'
                  }`} 
                />
              </div>
              {form.formState.errors.authors && (
                <p className="text-[10px] text-red-500 font-bold ml-1 italic">{form.formState.errors.authors.message}</p>
              )}
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

            {(activeFormat !== 'video' && activeFormat !== 'monograf' && activeFormat !== 'article' && activeFormat !== 'artikel') && (
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File Dokumen (Hanya PDF)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center gap-4 bg-gray-50/30 hover:bg-gray-50 hover:border-primary/50 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !file.name.toLowerCase().endsWith('.pdf')) {
                        toast.error('Hanya file PDF yang diperbolehkan');
                        e.target.value = '';
                        setSelectedFile(null);
                        return;
                      }
                      setSelectedFile(file);
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <FileUp className="w-10 h-10 text-gray-300" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter text-center">
                    {selectedFile ? selectedFile.name : 'Klik atau seret file PDF ke sini untuk upload'}
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
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Media</label>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.watch('category').split(',').map(s => s.trim()).filter(s => s.length > 0).length > 0 ? (
                  form.watch('category').split(',').map(s => s.trim()).filter(s => s.length > 0).map((cat, i) => (
                    <Badge key={i} variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-none px-2 py-0 text-[10px] h-5">
                      {cat}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic py-1">
                    [ Belum ada kategori dipilih ]
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <select 
                  onChange={(e) => {
                    const current = form.getValues('category');
                    const selected = e.target.value;
                    const items = current.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    if (!items.includes(selected)) {
                      form.setValue('category', items.concat(selected).join(', '));
                    }
                  }} 
                  className="flex-1 h-11 rounded-xl bg-white/5 border-none text-white px-4 text-xs font-bold appearance-none outline-none focus:ring-1 focus:ring-white/20"
                >
                  <option value="" className="bg-[#0B1B3D]">Pilih Kategori...</option>
                  {categories.map((catName, idx) => (
                    <option key={idx} value={catName} className="bg-[#0B1B3D]">
                      {catName}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => form.setValue('category', '')}
                  className="h-11 px-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                >
                  Reset
                </Button>
              </div>
              <p className="text-[9px] text-gray-500 font-medium italic mt-1 leading-tight">
                *Pilih dari daftar atau ketik langsung di kolom input (legacy support).
              </p>
              {form.formState.errors.category && (
                <p className="text-[10px] text-red-400 font-bold italic mt-2">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Publikasi</label>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <input
                  type="checkbox"
                  {...form.register('isPublished')}
                  className="w-4 h-4 rounded border-gray-600 bg-transparent text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <span className="text-xs font-bold text-gray-300">Publish ke Publik</span>
              </div>
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
