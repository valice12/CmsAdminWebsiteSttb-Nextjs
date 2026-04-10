"use client";

import { useState, useEffect } from 'react';
import { getAllMedia, deleteMedia } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ImageIcon, AlertCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getMediaColumns, MediaDTO } from '@/components/media/MediaColumns';
import { MediaDeleteDialog } from '@/components/media/MediaDeleteDialog';

export default function MediaPage() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadMedia();
  }, [pageIndex, pageSize]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMedia(pageIndex, pageSize);
      setMedia(data.items || data.Items || []);
      setTotalItems(data.totalMedia || data.TotalMedia || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal mengambil data media');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (item: MediaDTO) => {
    setSelectedMedia(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedia) {
      return;
    }
    try {
      setIsDeleting(true);
      // Get logical API format name (e.g. 'article' not 'artikel')
      const format = selectedMedia.mediaFormat.toLowerCase() === 'artikel' ? 'article' : selectedMedia.mediaFormat.toLowerCase();

      await deleteMedia(format, selectedMedia.id);
      toast.success(`Berhasil menghapus ${selectedMedia.mediaFormat}`);
      setDeleteDialogOpen(false);
      setSelectedMedia(null);
      loadMedia();
    } catch (error) {
      toast.error(`Gagal menghapus ${selectedMedia.mediaFormat}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewMedia = (item: MediaDTO) => {
    router.push(`/admin/media/${item.id}?format=${item.mediaFormat}`);
  };

  const columns = getMediaColumns({
    onDelete: handleDeleteClick,
    onView: handleViewMedia,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-primary" />
            Media Library (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manajemen multi-format konten media yang disinkronkan dari pusat data terpadu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-primary/20"
            />
          </div>
          <Button 
            onClick={() => router.push('/admin/media/create')} 
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Media Baru
          </Button>
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
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={media}
          isLoading={isLoading}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      <MediaDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedMedia={selectedMedia}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
