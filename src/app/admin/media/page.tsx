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
  mediaName: string; // Backend: MediaName
  mediaFormat: string; // Backend: MediaFormat
  publishedAt: string; // Backend: PublishedAt
  isPublished: boolean;
  createdAt: string;
  // Fallbacks for fields not in get-all DTO but used in UI
  authors?: { fullName: string }[];
  mediaDescription?: string;
  thumbnailPath?: string;
}

export default function MediaPage() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaDTO | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMedia(1, 100);
      setMedia(data.items || []);
    } catch (error) {
      toast.error('Gagal mengambil data media');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    try {
      // Get logical API format name (e.g. 'article' not 'artikel')
      const format = selectedMedia.mediaFormat.toLowerCase() === 'artikel' ? 'article' : selectedMedia.mediaFormat.toLowerCase();
      
      await deleteMedia(format, selectedMedia.id);
      toast.success(`Berhasil menghapus ${selectedMedia.mediaFormat}`);
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (error) {
      toast.error(`Gagal menghapus ${selectedMedia.mediaFormat}`);
    }
  };

  const columns: ColumnDef<MediaDTO>[] = [
    {
      accessorKey: 'thumbnailPath',
      header: 'Preview',
      cell: ({ row }) => (
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group relative">
          <img
            src={getImageUrl(row.original.thumbnailPath || '', row.original.mediaFormat)}
            alt={row.original.mediaName}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
            onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Media';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" 
               onClick={() => window.open(getImageUrl(row.original.thumbnailPath, row.original.mediaFormat), '_blank')}>
             <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'mediaName',
      header: 'Judul & Penulis',
      cell: ({ row }) => (
        <div className="max-w-xs text-left">
          <p className="font-bold text-gray-900 truncate hover:text-primary cursor-pointer transition-colors" 
             onClick={() => router.push(`/admin/media/${row.original.id}?format=${row.original.mediaFormat}`)}>
              {row.original.mediaName}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-extrabold uppercase tracking-widest">
            {row.original.authors?.map(a => a.fullName).join(', ') || 'No Author'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'mediaFormat',
      header: 'Tipe',
      cell: ({ row }) => (
         <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] bg-green-50 text-green-700 border-green-200">
           {row.original.mediaFormat}
         </Badge>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Upload Date',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-500">{formatDateTime(row.original.publishedAt || row.original.createdAt)}</span>
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

  // formats array removed

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
           <Button onClick={() => router.push('/admin/media/create')} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Tambah Media Baru
           </Button>
        </div>
        </div>
      </div>

      {/* Backend Note */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-purple-900">Media Terpadu</h3>
            <p className="text-sm text-purple-700 mt-1 leading-relaxed">
               Semua daftar artikel, jurnal, video, dan monograf ditampilkan dalam satu tabel ini sesuai spesifikasi terbaru.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left">
        <DataTable
          columns={columns}
          data={media}
          isLoading={isLoading}
          searchPlaceholder={`Cari media...`}
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus &quot;{selectedMedia?.mediaName}&quot;? Data yang dihapus tidak dapat dikembalikan.
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

