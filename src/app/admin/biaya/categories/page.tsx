"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { getAllCostCategories, deleteCostCategory, addCostCategory, editCostCategory } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { 
    Tag, Plus, Trash2, Edit, 
    MoreHorizontal, Search, DollarSign, Wallet
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

interface CostCategoryDTO {
  id: number;
  categoryName: string;
  createdAt?: string;
}

export default function CostCategoryPage() {
  const [categories, setCategories] = useState<CostCategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  
  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Partial<CostCategoryDTO> | null>(null);

  useEffect(() => {
    loadCategories();
  }, [pageIndex, pageSize]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCostCategories(pageIndex, pageSize);
      setCategories(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal memuat kategori biaya');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Item biaya yang terhubung mungkin akan terpengaruh.')) {
      try {
        await deleteCostCategory(id);
        toast.success('Kategori berhasil dihapus');
        loadCategories();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const handleOpenDialog = (category?: CostCategoryDTO) => {
    setSelectedCategory(category || { categoryName: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCategory?.categoryName) {
      toast.error('Nama kategori wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        Id: selectedCategory.id,
        CategoryName: selectedCategory.categoryName
      };

      if (selectedCategory.id) {
        await editCostCategory(payload);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addCostCategory(payload);
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

  const columns: ColumnDef<CostCategoryDTO>[] = [
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
             <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                <Tag className="w-5 h-5" />
             </div>
             <span className="font-extrabold text-gray-900 tracking-tight">{row.getValue('categoryName')}</span>
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
            className="h-9 w-9 hover:bg-amber-100 hover:text-amber-600 rounded-xl transition-all"
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
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <Wallet className="w-7 h-7" />
            </div>
            Kategori Biaya
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1 mt-2">
            Kelola pengelompokan biaya pendaftaran dan perkuliahan.
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

      {/* Info Card */}
      <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100 flex flex-col md:flex-row items-center gap-8 text-left">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/30">
             <DollarSign className="w-10 h-10" />
          </div>
          <div className="space-y-2">
             <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Pentingnya Kategorisasi</h3>
             <p className="text-sm text-amber-900/60 font-medium leading-relaxed">
                Kategori biaya membantu dalam pelaporan keuangan dan memberikan kejelasan bagi calon mahasiswa mengenai rincian dana yang harus dibayarkan (misal: Biaya Pendaftaran, Biaya Semester, Uang Pangkal).
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
              Berikan nama kategori yang deskriptif untuk pengelompokan biaya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-left">
             <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kategori</Label>
                <Input 
                  value={selectedCategory?.categoryName || ''}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, categoryName: e.target.value })}
                  placeholder="e.g. Biaya Operasional Pendidikan"
                  className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold shadow-inner focus:bg-white transition-all underline-offset-4"
                />
             </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black px-8 shadow-xl shadow-amber-500/20 flex-1 uppercase tracking-widest transition-all"
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
