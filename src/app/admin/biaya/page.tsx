"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllCosts, deleteCost } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { 
    DollarSign, Plus, Trash2, Edit, Tag, 
    GraduationCap, FileSpreadsheet, Search 
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";

interface CostDTO {
  id: number;
  categoryName: string;
  programName: string;
  costName: string;
  cost: number;
}

export default function BiayaPage() {
  const router = useRouter();
  const [costs, setCosts] = useState<CostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadCosts();
  }, [pageIndex, pageSize]);

  const loadCosts = async (searchOverride?: string) => {
    try {
      setIsLoading(true);
      const search = searchOverride !== undefined ? searchOverride : searchTerm;
      const data = await getAllCosts(pageIndex, pageSize, search);
      setCosts(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal memuat data biaya');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      loadCosts(searchTerm);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data biaya ini?')) {
      try {
        await deleteCost(id);
        toast.success('Data biaya berhasil dihapus');
        loadCosts();
      } catch (error) {
        toast.error('Gagal menghapus data biaya');
      }
    }
  };

  const columns: ColumnDef<CostDTO>[] = [
    {
      accessorKey: 'categoryName',
      header: 'Kategori',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-amber-500" />
            <span className="font-bold text-gray-700">{row.getValue('categoryName')}</span>
        </div>
      )
    },
    {
      accessorKey: 'programName',
      header: 'Program / Jurusan',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <GraduationCap className="w-3 h-3 text-blue-500" />
            <span className="font-medium text-gray-600">{row.getValue('programName')}</span>
        </div>
      )
    },
    {
      accessorKey: 'costName',
      header: 'Nama Biaya',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
            <span className="font-bold text-gray-900">{row.getValue('costName')}</span>
        </div>
      )
    },
    {
      accessorKey: 'cost',
      header: 'Total Biaya',
      cell: ({ row }) => (
        <div className="font-black text-amber-600">
           Rp {new Intl.NumberFormat('id-ID').format(row.getValue('cost'))}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/biaya/${row.original.id}`)}
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
    <div className="space-y-6 animate-in fade-in duration-700 font-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-500" />
            Manajemen Biaya Kuliah
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1">
            Administrasi daftar tarif biaya pendidikan dan pendaftaran mahasiswa.
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
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-amber-500/20"
            />
          </div>
          <Button 
            onClick={() => router.push('/admin/biaya/create')}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-11 px-8 shadow-xl shadow-amber-500/20 font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Tambah Biaya</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 text-left">
        <DataTable 
          columns={columns} 
          data={costs} 
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      {/* Info Card */}
      <div className="bg-[#0B1B3D] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-left">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
               <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 space-y-2">
               <h3 className="text-xl font-black tracking-tight uppercase italic">Sinkronisasi Biaya Real-time</h3>
               <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                  Perubahan data pada modul ini akan langsung berdampak pada rincian biaya yang dilihat oleh calon mahasiswa pada portal pendaftaran utama. Pastikan nominal yang dimasukkan sudah sesuai dengan kebijakan terbaru.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
