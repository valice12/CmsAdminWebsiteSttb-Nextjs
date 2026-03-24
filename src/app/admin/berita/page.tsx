"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllNews, deleteNews } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Newspaper, Search, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { formatDateTime, getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface NewsDTO {
  id: number;
  slug: string;
  title: string;
  content: string;
  publicationDate: string;
  imagePath: string;
  category: string[];
}

export default function BeritaPage() {
  const [news, setNews] = useState<NewsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsDTO | null>(null);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await deleteNews(id);
        toast.success('Berita berhasil dihapus');
        loadNews();
      } catch (error) {
        toast.error('Gagal menghapus berita');
        console.error(error);
      }
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const data = await getAllNews(1, 100);
      setNews(data.items);
    } catch (error) {
      toast.error('Gagal mengambil data berita dari backend');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<NewsDTO>[] = [
    {
      accessorKey: 'imagePath',
      header: 'Thumbnail',
      cell: ({ row }) => (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
          <img
            src={getImageUrl(row.original.imagePath, 'news')}
            alt={row.original.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=News';
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Judul Berita',
      cell: ({ row }) => (
        <div className="max-w-md text-left">
          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/admin/berita/${row.original.slug}`)}>
            {row.original.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium flex items-center gap-1">
             <span className="uppercase tracking-wider">SLUG: {row.original.slug}</span>
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
            <Badge key={i} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-bold uppercase tracking-wider text-[10px]">
              {cat}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'publicationDate',
      header: 'Tanggal Publikasi',
      cell: ({ row }) => (
        <div className="text-sm font-medium text-gray-600">
          {formatDateTime(row.original.publicationDate)}
        </div>
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
            onClick={() => router.push(`/admin/berita/${row.original.id}`)}
            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Manajemen Berita (Live Data)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Menampilkan data berita langsung dari Backend STTB.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/admin/berita/create")}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Tambah Berita</span>
        </Button>
      </div>

      {/* Backend Integration Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-amber-900">Manajemen Berita Live</h3>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
               Halaman ini terhubung langsung ke API Backend. Gunakan tombol di tabel untuk mengelola konten secara real-time.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left">
        <DataTable
          columns={columns}
          data={news}
          isLoading={isLoading}
          searchKey="title"
          searchPlaceholder="Cari berita dari backend..."
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="bg-red-500 h-2 w-full" />
          <div className="p-8">
            <DialogHeader className="text-left space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                <Trash2 className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">Hapus Berita?</DialogTitle>
              <DialogDescription className="text-gray-600 font-medium pt-2">
                Apakah Anda yakin ingin menghapus berita <span className="text-red-600 font-bold">"{selectedNews?.title}"</span>? <br/><br/>
                <span className="text-[10px] uppercase font-black text-red-400 tracking-widest italic flex items-center gap-1">
                   <AlertCircle className="w-3 h-3" /> Endpoint Delete Belum Tersedia di Backend
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
              >
                Batalkan
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                    toast.error("Gagal: Endpoint Delete tidak ditemukan di backend (404)");
                    setDeleteDialogOpen(false);
                }}
                className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
              >
                Konfirmasi Hapus
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
