"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllCourses, deleteCourse, addCourse, editCourse } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
    BookOpen, Plus, Trash2, Edit,
    GraduationCap, FileText, Search, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CourseDTO {
  id: number;
  courseName: string;
  credits: number;
  description?: string;
}

export default function MataKuliahPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Partial<CourseDTO> | null>(null);

  useEffect(() => {
    loadCourses();
  }, [pageIndex, pageSize]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourses(pageIndex, pageSize);
      setCourses(data.items || data.Items || []);
      // Robustly map total items from API (support totalCount, totalItems, etc.)
      const total = data.totalItems ?? data.TotalItems ?? data.totalCount ?? data.TotalCount ?? (Array.isArray(data.items) ? data.items.length : 0);
      setTotalItems(total);
      setPageCount(data.totalPages || data.TotalPages || Math.ceil(total / pageSize) || 0);
    } catch (error) {
      toast.error('Gagal memuat data mata kuliah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) {
      try {
        await deleteCourse(id);
        toast.success('Mata kuliah berhasil dihapus');
        loadCourses();
      } catch (error) {
        toast.error('Gagal menghapus mata kuliah');
      }
    }
  };

  const handleOpenDialog = (course?: CourseDTO) => {
    setSelectedCourse(course || { courseName: '', credits: 3, description: '' });
    setIsDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!selectedCourse?.courseName || !selectedCourse?.credits) {
      toast.error('Gunakan nama dan SKS yang valid');
      return;
    }

    try {
      setIsSubmitting(true);
      // Ensure we send correct property names to backend
      const payload = {
         Id: selectedCourse.id,
         CourseName: selectedCourse.courseName,
         Credits: selectedCourse.credits,
         Description: selectedCourse.description
      };

      if (selectedCourse.id) {
        await editCourse(payload);
        toast.success('Mata kuliah berhasil diperbarui');
      } else {
        await addCourse(payload);
        toast.success('Mata kuliah berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      loadCourses();
    } catch (error) {
      toast.error('Gagal menyimpan mata kuliah');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<CourseDTO>[] = [
    {
      accessorKey: 'courseName',
      header: 'Nama Mata Kuliah',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
               <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className="font-extrabold text-gray-900 text-sm tracking-tight tracking-tight leading-none mb-1">{row.getValue('courseName')}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Code ID: #{row.original.id}</span>
            </div>
        </div>
      )
    },
    {
      accessorKey: 'credits',
      header: 'SKS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-black border border-amber-100 italic">
                {row.getValue('credits')} SKS
            </span>
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-xs text-gray-500 font-medium text-left">
            {row.getValue('description') || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(row.original)}
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="h-9 w-9 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 leading-none">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <GraduationCap className="w-7 h-7" />
            </div>
            Manajemen Mata Kuliah
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1 mt-2">
            Pusat database kurikulum dan mata kuliah mandiri STTB.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] h-14 px-8 shadow-2xl shadow-primary/20 font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Tambah Matkul Baru
        </Button>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      {/* Info Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B1B3D] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />
             <div className="relative z-10 space-y-4 text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-3xl font-black">{totalItems}</h4>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Mata Kuliah</p>
                </div>
             </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex items-center gap-8 text-left">
             <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center shrink-0">
                <FileText className="w-10 h-10 text-amber-500" />
             </div>
             <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Database Kurikulum Mandiri</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                   Setiap mata kuliah yang didaftarkan di sini dapat dihubungkan ke berbagai Program Studi. Memudahkan konsistensi data kurikulum di seluruh sistem akademik.
                </p>
             </div>
          </div>
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-10 gap-8">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black text-navy tracking-tight leading-none">
              {selectedCourse?.id ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium mt-2">
              Masukkan detail mata kuliah. Pastikan jumlah SKS sesuai dengan silabus kurikulum.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Mata Kuliah</Label>
              <Input
                value={selectedCourse?.courseName || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, courseName: e.target.value })}
                placeholder="e.g. Pemrograman Berorientasi Objek"
                className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold shadow-inner focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah SKS</Label>
              <Input
                type="number"
                value={selectedCourse?.credits || 0}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, credits: parseInt(e.target.value) })}
                className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold shadow-inner focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi & Capaian</Label>
              <Textarea
                value={selectedCourse?.description || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                placeholder="Tuliskan deskripsi singkat mata kuliah..."
                rows={4}
                className="bg-gray-50/50 border-none rounded-2xl font-medium shadow-inner p-4 focus:bg-white resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleSaveCourse}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black px-8 shadow-xl shadow-primary/20 flex-1 uppercase tracking-widest"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-14 rounded-2xl font-black text-gray-500 border-none bg-gray-100 hover:bg-gray-200 uppercase tracking-widest px-6"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
