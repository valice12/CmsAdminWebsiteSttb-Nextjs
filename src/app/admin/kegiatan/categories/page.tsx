"use client";

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  getAllEventCategories,
  addEventCategory,
  editEventCategory,
  deleteEventCategory
} from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  CalendarRange, Plus, Trash2, Edit,
  Link as LinkIcon, Info, Sparkles
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

interface EventCategoryDTO {
  id: number;
  categoryName: string;
}

export default function EventCategoriesPage() {
  const [categories, setCategories] = useState<EventCategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Partial<EventCategoryDTO> | null>(null);

  useEffect(() => {
    loadCategories();
  }, [pageIndex, pageSize]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEventCategories(pageIndex, pageSize);
      setCategories(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal memuat kategori kegiatan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori kegiatan ini?')) {
      try {
        await deleteEventCategory(id);
        toast.success('Kategori berhasil dihapus');
        loadCategories();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const handleOpenDialog = (category?: EventCategoryDTO) => {
    setSelectedCategory(category || { categoryName: '' });
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setSelectedCategory({
      ...selectedCategory,
      categoryName: name,
    });
  };

  const handleSave = async () => {
    if (!selectedCategory?.categoryName) {
      toast.error('Nama wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedCategory.id) {
        await editEventCategory(selectedCategory.id, selectedCategory.categoryName);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addEventCategory(selectedCategory.categoryName);
        toast.success('Kategori berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<EventCategoryDTO>[] = [
    {
      accessorKey: 'id',
      header: 'ID Kategori',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-black text-[10px] border border-gray-100">
            #{row.getValue('id')}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'categoryName',
      header: 'Nama Kategori',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-gray-900 tracking-tight">{row.getValue('categoryName')}</span>
          </div>
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
            className="h-9 w-9 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <CalendarRange className="w-7 h-7" />
            </div>
            Kategori Kegiatan
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1 mt-2">
            Pengaturan pengelompokan event, seminar, dan workshop STTB.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#0B1B3D] hover:bg-[#152a5a] text-white rounded-[1.25rem] h-14 px-8 shadow-2xl shadow-navy/20 font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Tambah Kategori
        </Button>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100 flex items-start gap-5 text-left">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 uppercase tracking-tight text-sm">Informasi Kategori</h4>
            <p className="text-xs text-indigo-800/60 font-medium leading-relaxed mt-1">
              Gunakan kategori untuk mengelompokkan berbagai jenis kegiatan akademik maupun non-akademik di STTB agar memudahkan pencarian oleh audiens.
            </p>
          </div>
        </div>
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex items-center gap-5 text-left">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Kategori membantu pemisahan antara Event Akademik, Seminar Nasional, dan Kegiatan Mahasiswa di portal publik STTB.
          </p>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-10 gap-8 border-none shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black text-navy tracking-tight leading-none">
              {selectedCategory?.id ? 'Edit Kategori' : 'Kategori Baru'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium mt-2">
              Lengkapi detail kategori kegiatan di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kategori</Label>
              <Input
                value={selectedCategory?.categoryName || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Workshop Teknologi"
                className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold shadow-inner focus:bg-white transition-all underline-offset-4"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 shadow-xl shadow-indigo-500/20 flex-1 uppercase tracking-widest transition-all"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
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
