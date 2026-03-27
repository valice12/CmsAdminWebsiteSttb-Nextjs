"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllAcademicPrograms, deleteAcademicProgram } from '@/lib/api';
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
import { Plus, Edit, Trash2, GraduationCap, School, BookOpen, Star, AlertCircle, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

interface AkademikDTO {
  id: number;
  programName: string;
  degree: string;
  totalCredits: number;
}

export default function AkademikPage() {
  const [programs, setPrograms] = useState<AkademikDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AkademikDTO | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAcademicPrograms(1, 100);
      setPrograms(data.items);
    } catch (error) {
      toast.error('Gagal mengambil data akademik dari backend');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<AkademikDTO>[] = [
    {
      accessorKey: 'programName',
      header: 'Program Studi',
      cell: ({ row }) => (
        <div className="flex items-center gap-4 group text-left">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary/5 group-hover:border-primary/10">
            <GraduationCap className="w-6 h-6 text-primary transition-colors" />
          </div>
          <div>
            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/admin/akademik/${row.original.id}`)}>
              {row.original.programName}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              ID: {row.original.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'degree',
      header: 'Jenjang',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-2.5 py-0.5 shadow-none">
          {row.original.degree}
        </Badge>
      ),
    },

    {
      accessorKey: 'totalCredits',
      header: 'SKS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Award className="w-4 h-4 text-amber-500" />
          {row.original.totalCredits || '-'} SKS
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
            onClick={() => router.push(`/admin/akademik/${row.original.id}`)}
            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setSelectedProgram(row.original);
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
            <School className="w-8 h-8 text-primary" />
            Pusat Data Akademik (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manajemen program studi dan kurikulum sinkron dengan backend.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/admin/akademik/create")}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 font-extrabold" />
          <span className="font-bold">Tambah Program Studi</span>
        </Button>
      </div>

       {/* Backend Integration Note */}
       <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-amber-900">Catatan Integrasi Backend</h3>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
               Halaman ini menggunakan <code>api/v1/cms/academic-programs/get-all-academic-programs</code>. Data disinkronkan secara real-time.
            </p>
         </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
        <DataTable
          columns={columns}
          data={programs}
          isLoading={isLoading}
          searchKey="programName"
          searchPlaceholder="Cari program studi..."
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-md">
           <div className="bg-red-500 h-2 w-full" />
           <div className="p-10 space-y-8 text-left">
              <div className="space-y-4">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-100">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Hapus Data?</DialogTitle>
                    <DialogDescription className="font-bold text-gray-500 pt-3 text-base">
                      Anda akan menghapus program <span className="text-red-600 leading-relaxed font-black">"{selectedProgram?.programName}"</span> secara permanen.
                    </DialogDescription>
                  </DialogHeader>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 font-primary">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="flex-1 h-14 rounded-2xl font-black text-gray-500 border-none bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-widest text-[11px]"
                >
                  Batalkan
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                      try {
                        if (selectedProgram) {
                          await deleteAcademicProgram(selectedProgram.id);
                          toast.success("Berhasil menghapus program studi");
                          loadPrograms();
                        }
                      } catch (error) {
                        toast.error("Gagal menghapus program studi");
                      } finally {
                        setDeleteDialogOpen(false);
                      }
                  }}
                  className="flex-1 h-14 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[11px]"
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
