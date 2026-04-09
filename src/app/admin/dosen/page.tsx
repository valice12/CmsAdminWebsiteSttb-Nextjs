"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllLecturers, deleteLecturer } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Trash2, Plus, Edit, ExternalLink, Activity, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

interface LecturerDTO {
  id: number;
  lecturerName: string;
  organizationalRole: string;
  lecturerImagePath: string;
  roles: string[];
  degrees: string[];
}

export default function DosenPage() {
  const router = useRouter();
  const [data, setData] = useState<LecturerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await getAllLecturers(pageIndex, pageSize);
      setData(response.items || response.Items || []);
      setTotalItems(response.totalItems || response.TotalItems || 0);
      setPageCount(response.totalPages || response.TotalPages || 0);
    } catch (error) {
      console.error('Error loading lecturers:', error);
      toast.error('Gagal mengambil data Dosen');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<LecturerDTO>[] = [
    {
      accessorKey: 'lecturerName',
      header: 'Dosen / Pengajar',
      cell: ({ row }) => (
        <div className="flex items-center gap-4 group text-left">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 shadow-sm transition-all group-hover:scale-110">
             <img 
               src={getImageUrl(row.original.lecturerImagePath, 'lecturers')} 
               alt={row.original.lecturerName}
               className="w-full h-full object-cover"
               onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Lecturer';
               }}
             />
          </div>
          <div>
            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{row.original.lecturerName}</p>
            <div className="flex flex-wrap gap-1 mt-1">
                {row.original.degrees.map((deg, i) => (
                    <span key={i} className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{deg}</span>
                ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'organizationalRole',
      header: 'Spesialisasi',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-extrabold uppercase tracking-widest text-[9px] px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm">
           {row.original.organizationalRole}
        </Badge>
      ),
    },
    {
       accessorKey: 'roles',
       header: 'Jabatan Organisasi',
       cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
             {row.original.roles.map((r, i) => (
                <Badge key={i} variant="outline" className="text-[8px] font-black px-1.5 py-0 border-gray-100 text-gray-500 uppercase">
                   {r}
                </Badge>
             ))}
          </div>
       )
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
              if (row.original.lecturerImagePath) {
                window.open(getImageUrl(row.original.lecturerImagePath, 'lecturers'), '_blank');
              } else {
                toast.info("Gambar tidak tersedia");
              }
            }}
            className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition-colors"
            onClick={() => router.push(`/admin/dosen/${row.original.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
            onClick={async () => {
               if (confirm('Hapus dosen ini?')) {
                 await deleteLecturer(row.original.id);
                 loadData();
               }
            }}
          >
            <Trash2 className="h-4 w-4" />
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
            <GraduationCap className="w-10 h-10 text-emerald-500" />
            Manajemen Dosen
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Administrasi data <span className="text-emerald-600 font-bold italic">Dosen Akademik</span> Portal Utama.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari dosen..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-emerald-500/20"
            />
          </div>
          <Button 
            onClick={() => router.push('/admin/dosen/create')}
            className="rounded-2xl h-11 px-8 shadow-xl bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white font-black uppercase tracking-widest flex items-center gap-3 transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Dosen
          </Button>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-emerald-900">
             <Activity className="w-full h-full" />
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-emerald-500 text-white">
             <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-emerald-900">Sinkronisasi Data Dosen</h3>
            <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-emerald-700/80">
              Data ditarik secara real-time. Setiap perubahan di sini akan langsung memperbarui profil dosen di portal publik.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          globalFilter={searchTerm}
          onGlobalFilterChange={setSearchTerm}
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
