"use client";

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { getAllMedia, deleteMedia } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, FileImage, FileVideo, FileText, Upload, Eye, ExternalLink, ImageIcon, MonitorPlay, FileCode, AlertCircle, BookOpen, Layers, Newspaper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDateTime, getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaDTO {
  id: number;
  slug: string;
  mediaTitle: string;
  authors: { fullName: string }[];
  mediaDescription: string;
  publicationDate: string;
  category: string[];
  thumbnailPath: string;
}

export default function MediaPage() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState('video');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaDTO | null>(null);

  useEffect(() => {
    loadMedia();
  }, [activeFormat]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMedia(activeFormat, 1, 50);
      setMedia(data.items);
    } catch (error) {
      toast.error(`Gagal mengambil data ${activeFormat}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    try {
      await deleteMedia(activeFormat, selectedMedia.id);
      toast.success(`Berhasil menghapus ${activeFormat}`);
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (error) {
      toast.error(`Gagal menghapus ${activeFormat}`);
    }
  };

  const columns: ColumnDef<MediaDTO>[] = [
    {
      accessorKey: 'thumbnailPath',
      header: 'Preview',
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group relative">
          <img
            src={getImageUrl(row.original.thumbnailPath, activeFormat)}
            alt={row.original.mediaTitle}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
            onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Media';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => window.open(getImageUrl(row.original.thumbnailPath, activeFormat), '_blank')}>
             <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'mediaTitle',
      header: 'Judul & Penulis',
      cell: ({ row }) => (
        <div className="max-w-xs text-left">
          <p className="font-bold text-gray-900 truncate hover:text-primary cursor-pointer transition-colors" onClick={() => router.push(`/admin/media/${row.original.id}?format=${activeFormat}`)}>{row.original.mediaTitle}</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-extrabold uppercase tracking-widest">
            {row.original.authors.map(a => a.fullName).join(', ') || 'No Author'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
         <div className="flex flex-wrap gap-1">
            {row.original.category.map((cat, i) => (
               <Badge key={i} variant="outline" className="font-bold uppercase tracking-widest text-[9px] px-2 shadow-sm border bg-purple-50 text-purple-700 border-purple-100">
                 {cat}
               </Badge>
            ))}
         </div>
      ),
    },
    {
      accessorKey: 'publicationDate',
      header: 'Upload Date',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-500">{formatDateTime(row.original.publicationDate)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setSelectedMedia(row.original);
              setDeleteDialogOpen(true);
            }}
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const formats = [
      { id: 'video', label: 'Video', icon: MonitorPlay },
      { id: 'artikel', label: 'Artikel', icon: FileText },
      { id: 'journal', label: 'Journal', icon: BookOpen },
      { id: 'monograf', label: 'Monograf', icon: Layers },
      { id: 'buletin', label: 'Buletin', icon: Newspaper },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-primary" />
            Media Library (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manajemen multi-format konten media langsung dari database utama.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={() => router.push(`/admin/media/create?format=${activeFormat}`)} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Tambah {activeFormat.toUpperCase()}
           </Button>
        </div>
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100/50 p-2 rounded-2xl w-fit">
          {formats.map((f) => {
              const Icon = f.icon;
              return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFormat(f.id)}
                    className={`flex items-center gap-2 px-6 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeFormat === f.id 
                        ? 'bg-white text-primary shadow-md border-b-2 border-primary' 
                        : 'text-gray-500 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {f.label}
                  </button>
              );
          })}
      </div>

      {/* Backend Note */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-purple-900">Sinkronisasi Media</h3>
            <p className="text-sm text-purple-700 mt-1 leading-relaxed">
               Data difilter berdasarkan format <b>{activeFormat.toUpperCase()}</b> melalui endpoint <code>api/v1/cms/media/get-all?MediaFormat={activeFormat}</code>.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left">
        <DataTable
          columns={columns}
          data={media}
          isLoading={isLoading}
          searchPlaceholder={`Cari dalam kategori ${activeFormat}...`}
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus &quot;{selectedMedia?.mediaTitle}&quot;? Data yang dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

