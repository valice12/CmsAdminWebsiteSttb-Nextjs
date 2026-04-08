"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllAdmissionDeadlines, deleteAdmissionDeadline } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { 
    Calendar, Trash2, Edit, Info,
    UserCheck, Clock, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AdmissionDeadlineDTO {
  id: number;
  academicYear: string;
  batchOrder: number;
  batchDeadlineAt: string;
  formReturnDeadlineAt: string;
  documentSelectionDeadlineAt: string;
  resultBroadcastAt: string;
  participantCallAt: string;
  isActive: boolean;
}

export default function JadwalAdmisiPage() {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<AdmissionDeadlineDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadDeadlines();
  }, [pageIndex, pageSize]);

  const loadDeadlines = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAdmissionDeadlines(pageIndex, pageSize);
      setDeadlines(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal memuat data jadwal admisi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        await deleteAdmissionDeadline(id);
        toast.success('Jadwal berhasil dihapus');
        loadDeadlines();
      } catch (error) {
        toast.error('Gagal menghapus jadwal');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const columns: ColumnDef<AdmissionDeadlineDTO>[] = [
    {
      accessorKey: 'batchOrder',
      header: 'Gelombang',
      cell: ({ row }) => (
        <div className="font-bold text-gray-900">
            Gelombang {row.getValue('batchOrder')}
        </div>
      )
    },
    {
      accessorKey: 'academicYear',
      header: 'Tahun Akademik',
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">
            {row.getValue('academicYear')}
        </div>
      )
    },
    {
      accessorKey: 'batchDeadlineAt',
      header: 'Batas Pendaftaran',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-red-500" />
            <span className="font-bold text-gray-700">{formatDate(row.getValue('batchDeadlineAt'))}</span>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isActive ? 'Aktif' : 'Non-Aktif'}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/admisi/jadwal/${row.original.id}`)}
            className="h-8 w-8 hover:bg-amber-100 hover:text-amber-600 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Jadwal Admisi
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1">
            Manajemen gelombang pendaftaran dan batas akhir aktivitas admisi.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable 
          columns={columns} 
          data={deadlines} 
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      <div className="bg-[#0B1B3D] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-left">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
               <Info className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 space-y-2">
               <h3 className="text-xl font-black tracking-tight uppercase italic">Pentingnya Akurasi Tanggal</h3>
               <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                  Data jadwal ini digunakan langsung oleh sistem pendaftaran untuk membuka dan menutup akses formulir kepada calon mahasiswa. Pastikan semua tanggal batas akhir sudah dikonfirmasi oleh bagian akademik.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
