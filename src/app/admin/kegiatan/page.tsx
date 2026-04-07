"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllEvents, deleteEvent } from '@/lib/api';
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
import { Plus, Edit, Trash2, Calendar, MapPin, Globe, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateTime, getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface EventDTO {
  id: number;
  eventTitle: string;
  slug: string;
  startsAtDate: string;
  endsAtDate: string;
  description: string;
  organizerName: string;
  category: string[];
  imagePath: string;
}

export default function KegiatanPage() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      try {
        await deleteEvent(id);
        toast.success('Kegiatan berhasil dihapus');
        loadEvents();
      } catch (error) {
        toast.error('Gagal menghapus kegiatan');
        console.error(error);
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, [pageIndex, pageSize]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEvents(pageIndex, pageSize);
      setEvents(data.items || data.Items || []);
      setTotalItems(data.totalEvents || data.TotalEvents || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
       toast.error('Gagal mengambil data event dari backend');
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<EventDTO>[] = [
    {
      accessorKey: 'imagePath',
      header: 'Poster',
      cell: ({ row }) => (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
          <img
            src={getImageUrl(row.original.imagePath, 'events')}
            alt={row.original.eventTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Event';
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: 'eventTitle',
      header: 'Event & Penyelenggara',
      cell: ({ row }) => (
        <div className="max-w-md text-left">
          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/admin/kegiatan/${row.original.id}`)}>
            {row.original.eventTitle}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium flex items-center gap-1">
             <span className="uppercase tracking-wider">{row.original.organizerName}</span>
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
             <Badge key={i} variant="outline" className="font-bold uppercase tracking-widest text-[9px] px-2 shadow-sm bg-blue-50 text-blue-600 border-blue-100">
               {cat}
             </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'startsAtDate',
      header: 'Waktu Pelaksanaan',
      cell: ({ row }) => (
        <div className="text-sm font-medium text-gray-600 flex flex-col items-start">
          <span>{formatDateTime(row.original.startsAtDate)}</span>
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
            onClick={() => router.push(`/admin/kegiatan/${row.original.id}`)}
            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setSelectedEvent(row.original);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Kegiatan & Event (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Sinkronisasi data kegiatan kampus langsung dari pusat server.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/admin/kegiatan/create")}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Entry Event Baru</span>
        </Button>
      </div>

       {/* Backend Integration Note */}
       <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-blue-900">Manajemen Event Live</h3>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
               Halaman ini terhubung langsung ke API Backend. Gunakan tombol aksi untuk mengelola agenda kegiatan kampus.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left">
        <DataTable
          columns={columns}
          data={events}
          isLoading={isLoading}
          searchKey="eventTitle"
          searchPlaceholder="Cari data kegiatan..."
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-md">
           <div className="bg-red-500 h-2 w-full" />
           <div className="p-8 space-y-6 text-left">
              <DialogHeader className="space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                  <Trash2 className="w-8 h-8" />
                </div>
                <DialogTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Hapus Agenda?</DialogTitle>
                <DialogDescription className="font-medium text-gray-500 pt-2">
                  Apakah Anda yakin ingin menghapus agenda <span className="text-red-600 font-bold">"{selectedEvent?.eventTitle}"</span>? <br/><br/>
                  <span className="text-[10px] uppercase font-black text-red-400 tracking-widest italic flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" /> Endpoint Delete Belum Tersedia di Backend
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 h-12 rounded-xl font-bold text-gray-500 border-none bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px]"
                >
                  Batalkan
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                      if (selectedEvent) {
                         const id = (selectedEvent as any).id;
                         if (id) handleDelete(id);
                         setDeleteDialogOpen(false);
                      }
                  }}
                  className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[10px]"
                >
                  Hapus Agenda
                </Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
