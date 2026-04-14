"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllAdministrators, getAllLecturers, deleteAdministrator, deleteLecturer } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCircle, Users, GraduationCap, Briefcase, Trash2, Star, Shield, ExternalLink, Activity, Info, CheckCircle, Plus, Mail, Phone, MapPin, User, ChevronRight, Search, FileText, Layout, Edit, MoreVertical, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, getImageUrl } from '@/lib/utils';

interface AdministratorDTO {
  id: number;
  name: string;
  division: string;
  role: string;
}

interface LecturerDTO {
  id: number;
  lecturerName: string;
  organizationalRole: string;
  lecturerImagePath: string;
  roles: string[];
  degrees: string[];
}

export default function PenggunaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaContent />
    </Suspense>
  );
}

function PenggunaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'foundation' | 'lecturer'>(
    tabParam === 'lecturer' ? 'lecturer' : 'foundation'
  );
  const [foundationItems, setFoundationItems] = useState<AdministratorDTO[]>([]);
  const [lecturers, setLecturers] = useState<LecturerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tabParam === 'lecturer' || tabParam === 'foundation') {
      setActiveTab(tabParam as 'foundation' | 'lecturer');
    }
  }, [tabParam]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'foundation') {
        const data = await getAllAdministrators();
        // Now treating all "Administrators" from API as "Pengurus Yayasan" based on user request
        setFoundationItems(data.items);
      } else {
        const data = await getAllLecturers();
        setLecturers(data.items);
      }
    } catch (error) {
      toast.error(`Gagal mengambil data ${activeTab === 'foundation' ? 'Pengurus' : 'Dosen'}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const foundationColumns: ColumnDef<AdministratorDTO>[] = [
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
        row.original.role ? (
          <Badge variant="outline" className="font-extrabold uppercase tracking-widest text-[9px] px-3 py-1 bg-amber-50 text-amber-700 border-amber-100 shadow-sm">
            <Shield className="w-3 h-3 mr-1.5" />
            {row.original.role}
          </Badge>
        ) : (
          <span className="text-sm font-bold text-gray-400 ml-4">-</span>
        )
      ),
    },
    {
      accessorKey: 'division',
      header: 'Divisi / Unit',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
           <Briefcase className="w-4 h-4 text-gray-400" />
           {row.original.division || '-'}
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
            onClick={() => router.push(`/admin/pengguna/${row.original.id}?type=foundation`)}
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

  const lecturerColumns: ColumnDef<LecturerDTO>[] = [
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
           {row.original.organizationalRole || '-'}
        </Badge>
      ),
    },
    {
       accessorKey: 'roles',
       header: 'Jabatan Organisasi',
       cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
             {row.original.roles && row.original.roles.length > 0 ? row.original.roles.map((r, i) => (
                <Badge key={i} variant="outline" className="text-[8px] font-black px-1.5 py-0 border-gray-100 text-gray-500 uppercase">
                   {r}
                </Badge>
             )) : (
                <span className="text-sm font-black text-gray-900">-</span>
             )}
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
            onClick={() => router.push(`/admin/pengguna/${row.original.id}?type=lecturer`)}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Manajemen Pengguna
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Administrasi data <span className="text-amber-600 font-bold italic">Pengurus Yayasan</span> dan <span className="text-emerald-600 font-bold italic">Dosen Akademik</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={() => router.push(`/admin/pengguna/create?type=${activeTab}`)} 
             className={`rounded-2xl h-12 px-8 shadow-xl flex items-center gap-3 transition-all font-black uppercase tracking-widest ${
               activeTab === 'foundation' 
               ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
               : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
             } text-white`}
           >
             <Plus className="w-5 h-5" />
             Tambah {activeTab === 'foundation' ? 'Pengurus' : 'Dosen'}
           </Button>
        </div>
      </div>

       {/* Tab Selector */}
       <div className="flex items-center gap-2 bg-gray-100/50 p-2 rounded-[1.5rem] w-fit">
          <button
            onClick={() => {
                setActiveTab('foundation');
                router.push('/admin/pengguna?tab=foundation');
            }}
            className={`flex items-center gap-3 px-8 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'foundation' 
                ? 'bg-white text-amber-600 shadow-xl shadow-gray-200 border-b-2 border-amber-500' 
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <Star className="w-4 h-4" />
            Pengurus Yayasan
          </button>
          <button
            onClick={() => {
                setActiveTab('lecturer');
                router.push('/admin/pengguna?tab=lecturer');
            }}
            className={`flex items-center gap-3 px-8 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'lecturer' 
                ? 'bg-white text-emerald-600 shadow-xl shadow-gray-200 border-b-2 border-emerald-500' 
                : 'text-gray-500 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Dosen / Pengajar
          </button>
      </div>

       {/* Live Data Note */}
       <div className={`${activeTab === 'foundation' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'} border rounded-[2rem] p-8 flex items-start gap-6 text-left transition-colors duration-500 shadow-sm relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 ${activeTab === 'foundation' ? 'text-amber-900' : 'text-emerald-900'}`}>
             <Activity className="w-full h-full" />
          </div>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${activeTab === 'foundation' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
             {activeTab === 'foundation' ? <Star className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
          </div>
          <div>
            <h3 className={`text-xl font-black tracking-tight ${activeTab === 'foundation' ? 'text-amber-900' : 'text-emerald-900'}`}>
               Sinkronisasi Data {activeTab === 'foundation' ? 'Struktural Yayasan' : 'Akademik Dosen'}
            </h3>
             <p className={`text-sm mt-1 font-medium leading-relaxed max-w-2xl ${activeTab === 'foundation' ? 'text-amber-700/80' : 'text-emerald-700/80'}`}>
                Data ditarik secara real-time dari portal utama. Seluruh perubahan pada pusat data akan langsung tercermin di sini.
             </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
        <DataTable
          columns={(activeTab === 'lecturer' ? lecturerColumns : foundationColumns) as any}
          data={(activeTab === 'lecturer' ? lecturers : foundationItems) as any}
          isLoading={isLoading}
          searchKey={activeTab === 'lecturer' ? 'lecturerName' : 'name'}
          searchPlaceholder={`Cari ${activeTab === 'foundation' ? 'pengurus' : 'dosen'}...`}
        />
      </div>
    </div>
  );
}
