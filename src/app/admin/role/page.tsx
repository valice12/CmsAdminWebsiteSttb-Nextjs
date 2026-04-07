"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  CheckCircle, 
  X,
  Search,
  Settings2,
  Key,
  Database,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface RoleDTO {
  id: number;
  name: string;
  rolePermissions: string[];
  createdAt: string;
}

interface PermissionDTO {
  id: number;
  name: string;
  createdAt?: string;
}

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

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, name: string, type: 'role' | 'permission' } | null>(null);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes('SuperAdmin')) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permsData] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
      ]);
      
      setRoles(rolesData.items || []);
      setPermissions(permsData.items || []);
    } catch (error) {
      toast.error('Gagal mengambil data roles & permissions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Role Handlers ---

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

  // --- Permission Handlers ---

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

  // --- Unified Delete Handler ---

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

  // --- Table Columns ---

  const roleColumns: ColumnDef<RoleDTO>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm transition-all group-hover:scale-110">
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="font-bold text-gray-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'rolePermissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const perms = row.original.rolePermissions || [];
        if (perms.length === 0) return <span className="text-[10px] text-gray-400 italic font-medium">No permissions assigned</span>;
        
        return (
          <div className="flex flex-wrap gap-1.5 max-w-[400px]">
            {perms.map((p, i) => (
              <Badge key={i} variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-100/50">
                <Lock className="w-2.5 h-2.5 mr-1" />
                {p}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-9 w-9 text-indigo-500 hover:bg-indigo-50"
            onClick={() => handleOpenRoleDialog(row.original)}
          >
            <Edit className="w-4.5 h-4.5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-9 w-9 text-red-500 hover:bg-red-50"
            onClick={() => confirmDelete(row.original.id, row.original.name, 'role')}
          >
            <Trash2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      ),
    }
  ];

  const permColumns: ColumnDef<PermissionDTO>[] = [
    {
      accessorKey: 'name',
      header: 'Permission Key',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm transition-all group-hover:scale-110">
            <Key className="w-5 h-5 text-amber-500" />
          </div>
          <code className="px-2 py-1 bg-gray-50 rounded-md font-mono text-sm font-bold text-gray-700">
            {row.original.name}
          </code>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Register Date',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-gray-500">
           {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-9 w-9 text-red-500 hover:bg-red-50"
            onClick={() => confirmDelete(row.original.id, row.original.name, 'permission')}
          >
            <Trash2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      ),
    }
  ];

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
      return null; // or loading spinner
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

        {/* Action Buttons - Distinct from Tab Selection */}
        <div className="flex items-center gap-3">
           {activeTab === 'roles' ? (
              <Button 
                  onClick={() => handleOpenRoleDialog()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 rounded-2xl px-8 h-14 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black uppercase tracking-widest text-[12px]"
              >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  Tambah Role
              </Button>
           ) : (
              <Button 
                  onClick={() => setIsPermDialogOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 rounded-2xl px-8 h-14 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group font-black uppercase tracking-widest text-[12px]"
              >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
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
            
            {/* Summary counters in the tab bar area */}
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
            {/* Guide Card for Roles */}
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

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
                <DataTable
                    columns={roleColumns}
                    data={roles}
                    isLoading={isLoading}
                    searchKey="name"
                    searchPlaceholder="Cari role..."
                />
            </div>
        </TabsContent>

        <TabsContent value="permissions" className="animate-in slide-in-from-right-4 duration-500 m-0">
             {/* Guide Card for Permissions */}
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

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
                <DataTable
                    columns={permColumns}
                    data={permissions}
                    isLoading={isLoading}
                    searchKey="name"
                    searchPlaceholder="Cari permission key..."
                />
            </div>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-10 bg-indigo-600 text-white text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase relative z-10">
              {editingRole ? 'Update Role' : 'Tambah Role Baru'}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 font-medium opacity-90 relative z-10">
              Konfigurasi tingkatan akses dengan memilih permission yang sesuai.
            </DialogDescription>
          </DialogHeader>
          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nama Role</Label>
              <Input 
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                placeholder="Misal: Marketing Senior"
                className="h-14 bg-gray-50 border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pilih Access Keys ({roleFormData.selectedPermissions.length})</Label>
                <div className="flex gap-2">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 rounded-lg h-7"
                    onClick={() => setRoleFormData({...roleFormData, selectedPermissions: permissions.map(p => p.name)})}
                   >
                     Select All
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[9px] font-black uppercase text-gray-400 hover:bg-gray-50 rounded-lg h-7"
                    onClick={() => setRoleFormData({...roleFormData, selectedPermissions: []})}
                   >
                     Clear
                   </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {permissions.map((perm) => (
                  <div 
                    key={perm.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      roleFormData.selectedPermissions.includes(perm.name)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-md'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                    onClick={() => togglePermissionInRole(perm.name)}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-colors ${roleFormData.selectedPermissions.includes(perm.name) ? 'bg-indigo-300/20' : 'bg-gray-100'}`}>
                           <Lock className={`w-4 h-4 ${roleFormData.selectedPermissions.includes(perm.name) ? 'text-indigo-600' : 'text-gray-400'}`} />
                        </div>
                       <span className="text-sm font-black tracking-tight">{perm.name}</span>
                    </div>
                    <Checkbox 
                      checked={roleFormData.selectedPermissions.includes(perm.name)}
                      onCheckedChange={() => togglePermissionInRole(perm.name)}
                      className="h-6 w-6 border-2 border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsRoleDialogOpen(false)}
              className="font-black uppercase tracking-widest text-[11px] text-gray-500 hover:bg-gray-100 h-14"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={isLoading}
              className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-indigo-200 grow sm:grow-0 transition-all active:scale-95"
            >
              {isLoading ? 'Processing...' : (editingRole ? 'Update Role' : 'Create Role')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-10 bg-amber-500 text-white text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase relative z-10">Add Permission</DialogTitle>
            <DialogDescription className="text-amber-100 font-medium opacity-90 relative z-10">
              Daftarkan functional access key baru ke dalam sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="p-10">
             <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Permission Key Name (PascalCase)</Label>
               <Input 
                 value={permFormData.name}
                 onChange={(e) => setPermFormData({ name: e.target.value })}
                 placeholder="Misal: CanManageInventory"
                 className="h-14 bg-gray-50 border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-amber-500 text-lg"
               />
               <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Gunakan format PascalCase untuk konsistensi di Backend.
               </p>
             </div>
          </div>
          <DialogFooter className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
             <Button 
              variant="ghost" 
              onClick={() => setIsPermDialogOpen(false)}
              className="font-black uppercase tracking-widest text-[11px] text-gray-500 hover:bg-gray-100 h-14"
            >
              Batal
            </Button>
             <Button 
                onClick={handleSavePermission} 
                className="h-14 px-10 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-amber-200 transition-all active:scale-95"
             >
                Save Key
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

       {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Registered Roles', value: roles.length, icon: Shield, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
            { label: 'Access Keys', value: permissions.length, icon: Lock, color: 'text-amber-500', bgColor: 'bg-amber-50' },
            { label: 'Policy Coverage', value: '100%', icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
          ].map((stat, i) => (
             <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group hover:-translate-y-1">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                 </div>
                 <div className={`w-20 h-20 rounded-[1.5rem] ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <stat.icon className={`w-10 h-10 opacity-60 ${stat.color}`} />
                 </div>
             </div>
          ))}
       </div>
    </div>
  );
}
