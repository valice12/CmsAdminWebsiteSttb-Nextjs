"use client";

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  getAllNewsCategories, 
  addNewsCategory, 
  editNewsCategory, 
  deleteNewsCategory 
} from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, Plus, Trash2, Edit, 
  Tag, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { GenericCategoryDialog } from '@/components/common/GenericCategoryDialog';

interface NewsCategoryDTO {
  id: number;
  categoryName: string;
}

const getColumns = (
  onEdit: (item: NewsCategoryDTO) => void,
  onDelete: (id: number) => void
): ColumnDef<NewsCategoryDTO>[] => [
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
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
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
          onClick={() => onEdit(row.original)}
          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.original.id)}
          className="h-9 w-9 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function NewsCategoriesPage() {
  const [categories, setCategories] = useState<NewsCategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  
  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Partial<NewsCategoryDTO> | null>(null);

  useEffect(() => {
    loadCategories();
  }, [pageIndex, pageSize]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllNewsCategories(pageIndex, pageSize);
      setCategories(data.items || data.Items || []);
      setTotalItems(data.totalItems || data.TotalItems || 0);
      setPageCount(data.totalPages || data.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal memuat kategori berita');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori berita ini?')) {
      try {
        await deleteNewsCategory(id);
        toast.success('Kategori berhasil dihapus');
        loadCategories();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const handleOpenDialog = (category?: NewsCategoryDTO) => {
    setSelectedCategory(category || { categoryName: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async (name: string) => {
    try {
      setIsSubmitting(true);
      if (selectedCategory?.id) {
        await editNewsCategory(selectedCategory.id, name);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addNewsCategory(name);
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

  const columns = getColumns(handleOpenDialog, handleDelete);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Newspaper className="w-7 h-7" />
            </div>
            Kategori Berita
          </h1>
          <p className="text-muted-foreground font-medium text-sm ml-1 mt-2">
            Kelola klasifikasi berita dan artikel portal STTB.
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

      {/* Info Panel */}
      <div className="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 flex items-center gap-6 text-left">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
             <Hash className="w-6 h-6 text-blue-600" />
          </div>
          <div>
             <h4 className="font-black text-blue-900 uppercase tracking-tight text-sm">Konsistensi Konten</h4>
             <p className="text-xs text-blue-800/60 font-medium leading-relaxed mt-1">
                Gunakan kategori yang relevan untuk memudahkan pengunjung memfilter berita sesuai minat mereka. Kategori yang sudah digunakan oleh berita tidak disarankan untuk dihapus.
             </p>
          </div>
      </div>

      <GenericCategoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedCategory={selectedCategory as any}
        onSave={handleSave}
        isLoading={isSubmitting}
        title={{
          add: "Kategori Baru",
          edit: "Edit Kategori"
        }}
        description="Berikan nama kategori yang unik dan deskriptif."
        label="Nama Kategori"
        colorTheme="blue"
      />
    </div>
  );
}
