"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllAdministrators, deleteAdministrator } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Shield, Briefcase, Trash2, Plus, Edit, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AdministratorDTO {
  id: number;
  name: string;
  division: string;
  role: string;
}

export default function PengurusYayasanPage() {
  const router = useRouter();
  const [data, setData] = useState<AdministratorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [pageIndex, pageSize]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAdministrators(pageIndex, pageSize);
      setData(response.items || response.Items || []);
      setTotalItems(response.totalItems || response.TotalItems || 0);
      setPageCount(response.totalPages || response.TotalPages || 0);
    } catch (error) {
      console.error('Error loading administrators:', error);
      toast.error('Gagal mengambil data Pengurus Yayasan');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<AdministratorDTO>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Pengurus',
      cell: ({ row }) => (
        <div className="flex items-center gap-4 group text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm transition-all group-hover:scale-110">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{row.original.name}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">ID: {row.original.id}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Jabatan / Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-extrabold uppercase tracking-widest text-[9px] px-3 py-1 bg-amber-50 text-amber-700 border-amber-100 shadow-sm">
          <Shield className="w-3 h-3 mr-1.5" />
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'division',
      header: 'Divisi / Unit',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
           <Briefcase className="w-4 h-4 text-gray-400" />
           {row.original.division}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-colors"
            onClick={() => router.push(`/admin/pengurus-yayasan/${row.original.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              if (confirm('Hapus pengurus ini?')) {
                await deleteAdministrator(row.original.id);
                loadData();
              }
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
            <Star className="w-10 h-10 text-amber-500" />
            Pengurus Yayasan
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Administrasi data <span className="text-amber-600 font-bold italic">Pengurus Yayasan</span> Portal Utama.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/admin/pengurus-yayasan/create')}
          className="rounded-2xl h-12 px-8 shadow-xl bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white font-black uppercase tracking-widest flex items-center gap-3 transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengurus
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-amber-900">
             <Activity className="w-full h-full" />
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-amber-500 text-white">
             <Star className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-amber-900">Sinkronisasi Data Pengurus</h3>
            <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-amber-700/80">
              Data ditarik secara real-time. Setiap perubahan di sini akan langsung memperbarui informasi pengurus di portal publik.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Cari pengurus..."
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>
    </div>
  );
}
