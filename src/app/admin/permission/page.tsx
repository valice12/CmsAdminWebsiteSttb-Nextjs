"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { 
  Key, 
  Plus, 
  Search,
  Database,
  ArrowRight,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  getAllPermissions,
  addPermission,
  deletePermission
} from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Import local components
import { PermissionDialog } from '@/components/role/PermissionDialog';
import { getPermissionColumns, PermissionDTO } from '@/components/role/RoleColumns';
import { RoleStats } from '@/components/role/RoleStats';

export default function PermissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  
  // Dialog States
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [permFormData, setPermFormData] = useState({
    name: ''
  });

  // Pagination
  const [permPage, setPermPage] = useState(1);
  const [permPageSize, setPermPageSize] = useState(99);
  const [permTotal, setPermTotal] = useState(0);
  const [permPageCount, setPermPageCount] = useState(0);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, name: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes('SuperAdmin')) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      loadPermissions();
    }
  }, [permPage, permPageSize]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const permsData = await getAllPermissions(permPage, permPageSize);
      
      const rawPerms = permsData.items || permsData.Items || [];
      setPermissions(rawPerms.map((p: any) => ({
        id: p.id || p.Id,
        name: p.name || p.Name,
        createdAt: p.createdAt || p.CreatedAt
      })));
      setPermTotal(permsData.totalPermissions || permsData.TotalPermissions || permsData.totalItems || permsData.TotalItems || 0);
      setPermPageCount(permsData.totalPages || permsData.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal mengambil data permissions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermission = async () => {
    if (!permFormData.name.trim()) {
      toast.error('Nama permission harus diisi');
      return;
    }

    try {
      setIsLoading(true);
      await addPermission(permFormData.name);
      toast.success('Permission berhasil ditambahkan');
      setIsPermDialogOpen(false);
      setPermFormData({ name: '' });
      loadPermissions();
    } catch (error) {
      toast.error('Gagal menambahkan permission');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: number, name: string) => {
    setItemToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      setIsLoading(true);
      await deletePermission(itemToDelete.id);
      toast.success(`Permission "${itemToDelete.name}" berhasil dihapus`);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadPermissions();
    } catch (error) {
      toast.error(`Gagal menghapus permission`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const permColumns = getPermissionColumns({
    onDeletePermission: (id, name) => confirmDelete(id, name)
  });

  if (isAuthorized === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-red-100">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Access Restricted</h2>
        <p className="text-gray-500 font-medium text-lg max-w-md text-center leading-snug">
          Halaman ini hanya dapat diakses oleh <span className="text-red-600 font-black italic">SuperAdmin</span>. 
        </p>
        <Button 
          onClick={() => router.push('/admin/dashboard')}
          className="mt-10 h-14 px-10 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
        >
          Kembali ke Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isAuthorized === null) {
    return null;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
            <Key className="w-10 h-10 text-amber-500" />
            Permission Keys
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Daftar kunci akses fungsional sistem yang terdaftar di backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari permission key..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-amber-600/20"
            />
          </div>
          <Button 
              onClick={() => setIsPermDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 rounded-2xl px-8 h-11 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black uppercase tracking-widest text-[11px]"
          >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Tambah Permission
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 mb-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-amber-900">
              <Database className="w-full h-full" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shrink-0">
              <Database className="w-6 h-6" />
          </div>
          <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight text-amber-900">System Functional Keys</h3>
              <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-amber-900/70">
                  Daftar kunci akses fungsional yang digunakan di backend untuk validasi otorisasi data dan fitur.
              </p>
          </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
          <DataTable
              columns={permColumns}
              data={permissions}
              isLoading={isLoading}
              globalFilter={searchTerm}
              onGlobalFilterChange={setSearchTerm}
              totalItems={permTotal}
              pageCount={permPageCount}
              pageIndex={permPage}
              pageSize={permPageSize}
              onPageChange={(page) => setPermPage(page)}
          />
      </div>

      <PermissionDialog 
        open={isPermDialogOpen}
        onOpenChange={setIsPermDialogOpen}
        permFormData={permFormData}
        setPermFormData={setPermFormData}
        onSave={handleSavePermission}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="bg-red-500 h-3 w-full" />
          <div className="p-10">
            <DialogHeader className="text-left space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Delete Permission?</DialogTitle>
                <DialogDescription className="text-gray-500 font-medium text-lg leading-snug">
                  Apakah Anda yakin ingin menghapus permission <span className="text-red-600 font-black italic">"{itemToDelete?.name}"</span>?
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
              >
                Batalkan
              </Button>
              <Button
                variant="destructive"
                onClick={handleExecuteDelete}
                disabled={isLoading}
                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-red-500 hover:bg-red-600 text-white shadow-2xl shadow-red-200 transition-all hover:scale-105"
              >
                {isLoading ? 'Deleting...' : 'Konfirmasi Hapus'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <RoleStats rolesCount={0} permissionsCount={permissions.length} showRoles={false} />
    </div>
  );
}
