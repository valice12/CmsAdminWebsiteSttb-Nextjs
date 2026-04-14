"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllAcademicPrograms, deleteAcademicProgram } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, School, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getAcademicColumns, AkademikDTO } from '@/components/akademik/AcademicColumns';
import { AcademicDeleteDialog } from '@/components/akademik/AcademicDeleteDialog';
import { Input } from '@/components/ui/input';

export default function AkademikPage() {
  const [programs, setPrograms] = useState<AkademikDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AkademikDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadPrograms();
  }, [pageIndex, pageSize]);

  const loadPrograms = async (searchOverride?: string) => {
    try {
      setIsLoading(true);
      const search = searchOverride !== undefined ? searchOverride : searchTerm;
      const data = await getAllAcademicPrograms(pageIndex, pageSize, search);
      setPrograms(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal mengambil data akademik dari backend');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      loadPrograms(searchTerm);
    }
  };

  const handleEditClick = (program: AkademikDTO) => {
    router.push(`/admin/akademik/${program.id}`);
  };

  const handleDeleteClick = (program: AkademikDTO) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteAcademicProgram(selectedProgram.id);
      toast.success("Berhasil menghapus program studi");
      loadPrograms();
    } catch (error) {
      toast.error("Gagal menghapus program studi");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const columns = getAcademicColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <div className="space-y-6 font-primary animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <School className="w-8 h-8 text-primary" />
            Pusat Data Akademik (Live)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Manajemen program studi dan kurikulum yang disinkronkan secara real-time.
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
            onClick={() => router.push("/admin/akademik/create")}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-2xl px-6 h-11 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Tambah Program Studi</span>
          </Button>
        </div>
      </div>

       {/* Backend Integration Note */}
       <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4 text-left">
         <AlertCircle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
         <div>
            <h3 className="font-bold text-amber-900">Pusat Data Akademik</h3>
             <p className="text-sm text-amber-700 mt-1 leading-relaxed">
               Halaman ini menampilkan seluruh program studi dan kurikulum yang aktif. Seluruh data disinkronkan secara real-time.
             </p>
         </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={programs}
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      <AcademicDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedProgram={selectedProgram}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
