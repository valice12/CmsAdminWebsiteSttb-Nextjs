"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllNews, deleteNews } from '@/lib/api';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsDTO | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
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
  }, [pageIndex, pageSize]);

  const loadNews = async (searchOverride?: string) => {
    try {
      setIsLoading(true);
      // Use override (from Enter key) or current searchTerm if we want to support it, 
      // but the requirement is "only on Enter".
      const search = searchOverride !== undefined ? searchOverride : searchTerm;
      const data = await getAllNews(pageIndex, pageSize, search);
      setNews(data.items || data.Items || []);
      setTotalItems(data.totalNews || data.TotalNews || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal mengambil data berita dari backend');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      loadNews(searchTerm);
    }
  };

  const columns: ColumnDef<NewsDTO>[] = [
    // ... columns remain the same
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
          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/admin/berita/${row.original.id}`)}>
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
          {row.original.category?.map((cat, i) => (
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
    <div className="space-y-6 font-primary animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Manajemen Berita (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Menampilkan data berita yang disinkronkan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tekan Enter untuk cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-primary/20"
            />
          </div>
          <Button
            onClick={() => router.push("/admin/berita/create")}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl px-6 h-11 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Tambah Berita</span>
          </Button>
        </div>
      </div>

      {/* Backend Integration Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4 text-left">
        <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
        <div>
          <h3 className="font-bold text-amber-900">Manajemen Berita Live</h3>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">
            Halaman ini disinkronkan langsung dengan pusat data. Seluruh perubahan akan tercermin secara real-time di website utama.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={news}
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      {/* Delete Confirmation Dialog - same as before */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md text-left">
          <div className="bg-red-500 h-2 w-full" />
          <div className="p-8">
            <DialogHeader className="text-left space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-extrabold text-gray-900">Hapus Berita?</DialogTitle>
              <DialogDescription className="text-gray-600 font-medium pt-2">
                Apakah Anda yakin ingin menghapus berita <span className="text-red-600 font-bold">"{selectedNews?.title}"</span>?
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
                onClick={async () => {
                  if (selectedNews) {
                    await handleDelete(selectedNews.id);
                    setDeleteDialogOpen(false);
                  }
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
