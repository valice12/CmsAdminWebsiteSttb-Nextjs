"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { 
  Shield, 
  Plus, 
  Search,
  Settings2,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  getAllRoles, 
  addRole, 
  updateRole, 
  deleteRole, 
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

// Import local components
import { RoleDialog } from '@/components/role/RoleDialog';
import { PermissionDialog } from '@/components/role/PermissionDialog';
import { getRoleColumns, getPermissionColumns, RoleDTO, PermissionDTO } from '@/components/role/RoleColumns';
import { RoleStats } from '@/components/role/RoleStats';

export default function RolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [activeTab, setActiveTab] = useState('roles');
  
  // Dialog States for Role
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    selectedPermissions: [] as string[]
  });

  // Dialog States for Permission
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [permFormData, setPermFormData] = useState({
    name: ''
  });

  // Pagination for Roles
  const [rolePage, setRolePage] = useState(1);
  const [rolePageSize, setRolePageSize] = useState(100);
  const [roleTotal, setRoleTotal] = useState(0);
  const [rolePageCount, setRolePageCount] = useState(0);

  // Pagination for Permissions
  const [permPage, setPermPage] = useState(1);
  const [permPageSize, setPermPageSize] = useState(100);
  const [permTotal, setPermTotal] = useState(0);
  const [permPageCount, setPermPageCount] = useState(0);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, name: string, type: 'role' | 'permission' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes('SuperAdmin')) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      loadData();
    }
  }, [rolePage, rolePageSize, permPage, permPageSize]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permsData] = await Promise.all([
        getAllRoles(rolePage, rolePageSize),
        getAllPermissions(permPage, permPageSize)
      ]);
      
      const rawRoles = rolesData.items || rolesData.Items || [];
      setRoles(rawRoles.map((r: any) => ({
        id: r.id || r.Id,
        name: r.name || r.Name,
        rolePermissions: r.rolePermissions || r.RolePermissions || [],
        createdAt: r.createdAt || r.CreatedAt
      })));
      setRoleTotal(rolesData.totalRoles || rolesData.TotalRoles || rolesData.totalItems || rolesData.TotalItems || 0);
      setRolePageCount(rolesData.totalPages || rolesData.TotalPages || 0);

      const rawPerms = permsData.items || permsData.Items || [];
      setPermissions(rawPerms.map((p: any) => ({
        id: p.id || p.Id,
        name: p.name || p.Name,
        createdAt: p.createdAt || p.CreatedAt
      })));
      setPermTotal(permsData.totalPermissions || permsData.TotalPermissions || permsData.totalItems || permsData.TotalItems || 0);
      setPermPageCount(permsData.totalPages || permsData.TotalPages || 0);
    } catch (error) {
      toast.error('Gagal mengambil data roles & permissions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRoleDialog = (role?: RoleDTO) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        selectedPermissions: role.rolePermissions || []
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        selectedPermissions: []
      });
    }
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleFormData.name.trim()) {
      toast.error('Nama role harus diisi');
      return;
    }

    try {
      setIsLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, roleFormData.name, roleFormData.selectedPermissions);
        toast.success('Role berhasil diperbarui');
      } else {
        await addRole(roleFormData.name, roleFormData.selectedPermissions);
        toast.success('Role baru berhasil ditambahkan');
      }
      setIsRoleDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan role');
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
      loadData();
    } catch (error) {
      toast.error('Gagal menambahkan permission');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id: number, name: string, type: 'role' | 'permission') => {
    setItemToDelete({ id, name, type });
    setDeleteDialogOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      if (itemToDelete.type === 'role') {
        await deleteRole(itemToDelete.id);
        toast.success(`Role "${itemToDelete.name}" berhasil dihapus`);
      } else {
        await deletePermission(itemToDelete.id);
        toast.success(`Permission "${itemToDelete.name}" berhasil dihapus`);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      toast.error(`Gagal menghapus ${itemToDelete.type}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermissionInRole = (permName: string) => {
    setRoleFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permName)
        ? prev.selectedPermissions.filter(p => p !== permName)
        : [...prev.selectedPermissions, permName]
    }));
  };

  const roleColumns = getRoleColumns({
    onEditRole: handleOpenRoleDialog,
    onDeleteRole: (id, name) => confirmDelete(id, name, 'role')
  });

  const permColumns = getPermissionColumns({
    onDeletePermission: (id, name) => confirmDelete(id, name, 'permission')
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
          Silakan hubungi administrator sistem untuk bantuan.
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
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Konfigurasi sistem hak akses fungsional untuk keamanan platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Cari ${activeTab === 'roles' ? 'role' : 'permission'}...`}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-indigo-600/20"
            />
          </div>
           {activeTab === 'roles' ? (
              <Button 
                  onClick={() => handleOpenRoleDialog()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 rounded-2xl px-8 h-11 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black uppercase tracking-widest text-[11px]"
              >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Tambah Role
              </Button>
           ) : (
              <Button 
                  onClick={() => setIsPermDialogOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 rounded-2xl px-8 h-11 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black uppercase tracking-widest text-[11px]"
              >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Tambah Permission
              </Button>
           )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
            <TabsList className="bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner h-auto">
                <TabsTrigger value="roles" className="rounded-xl px-10 py-3.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl font-black uppercase tracking-widest text-[10px] transition-all">
                    User Roles
                </TabsTrigger>
                <TabsTrigger value="permissions" className="rounded-xl px-10 py-3.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-xl font-black uppercase tracking-widest text-[10px] transition-all">
                    System Permissions
                </TabsTrigger>
            </TabsList>
            
            <div className="hidden lg:flex items-center gap-8">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Roles</span>
                  <span className="text-xl font-black text-indigo-600">{roles.length}</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Permissions</span>
                  <span className="text-xl font-black text-amber-500">{permissions.length}</span>
               </div>
            </div>
        </div>

        <TabsContent value="roles" className="animate-in slide-in-from-left-4 duration-500 m-0">
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 mb-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-indigo-900">
                    <Shield className="w-full h-full" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shrink-0">
                    <Settings2 className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black tracking-tight text-indigo-900">User Role Groups</h3>
                    <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-indigo-900/70">
                        Kelompokkan permission ke dalam Role untuk mempermudah manajemen user. SuperAdmin memiliki akses penuh secara default.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
                <DataTable
                    columns={roleColumns}
                    data={roles}
                    isLoading={isLoading}
                    globalFilter={searchTerm}
                    onGlobalFilterChange={setSearchTerm}
                    totalItems={roleTotal}
                    pageCount={rolePageCount}
                    pageIndex={rolePage}
                    pageSize={rolePageSize}
                    onPageChange={(page) => setRolePage(page)}
                />
            </div>
        </TabsContent>

        <TabsContent value="permissions" className="animate-in slide-in-from-right-4 duration-500 m-0">
             <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 mb-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-amber-900">
                    <Lock className="w-full h-full" />
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
        </TabsContent>
      </Tabs>

      <RoleDialog 
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        editingRole={editingRole}
        roleFormData={roleFormData}
        setRoleFormData={setRoleFormData}
        permissions={permissions}
        isLoading={isLoading}
        onSave={handleSaveRole}
        togglePermissionInRole={togglePermissionInRole}
      />

      <PermissionDialog 
        open={isPermDialogOpen}
        onOpenChange={setIsPermDialogOpen}
        permFormData={permFormData}
        setPermFormData={setPermFormData}
        onSave={handleSavePermission}
      />

      {/* Unified Styled Delete Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <div className="bg-red-500 h-3 w-full" />
          <div className="p-10">
            <DialogHeader className="text-left space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Delete {itemToDelete?.type}?</DialogTitle>
                <DialogDescription className="text-gray-500 font-medium text-lg leading-snug">
                  Apakah Anda yakin ingin menghapus <span className="text-red-600 font-black italic">"{itemToDelete?.name}"</span>?
                  Aksi ini bersifat permanen dan tidak dapat dibatalkan.
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

      <RoleStats rolesCount={roles.length} permissionsCount={permissions.length} />
    </div>
  );
}
