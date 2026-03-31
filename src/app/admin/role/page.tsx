"use client";

import { useState, useEffect } from 'react';
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
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  getAllRoles, 
  addRole, 
  updateRole, 
  deleteRole, 
  getAllPermissions 
} from '@/lib/api';

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

interface RoleDTO {
  id: number;
  name: string;
  rolePermissions: string[];
  createdAt: string;
}

interface PermissionDTO {
  id: number;
  name: string;
}

export default function RolePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    selectedPermissions: [] as string[]
  });

  useEffect(() => {
    loadData();
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

  const handleOpenDialog = (role?: RoleDTO) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        selectedPermissions: role.rolePermissions || []
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        selectedPermissions: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama role harus diisi');
      return;
    }

    try {
      setIsLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, formData.name, formData.selectedPermissions);
        toast.success('Role berhasil diperbarui');
      } else {
        await addRole(formData.name, formData.selectedPermissions);
        toast.success('Role baru berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan role');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus role ini?')) return;
    
    try {
      setIsLoading(true);
      await deleteRole(id);
      toast.success('Role berhasil dihapus');
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus role');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permName)
        ? prev.selectedPermissions.filter(p => p !== permName)
        : [...prev.selectedPermissions, permName]
    }));
  };

  const columns: ColumnDef<RoleDTO>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm transition-all group-hover:scale-110">
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="font-bold text-gray-900 uppercase tracking-tight">{row.original.name}</span>
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
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
        </span>
      ),
    },
    // Aksi column removed for read-only mode
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
            <Lock className="w-10 h-10 text-amber-500" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Konfigurasi hak akses fungsional untuk setiap tingkatan role (Read-Only).
          </p>
        </div>
      </div>

       {/* Guide Card */}
       <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-amber-900">
             <Shield className="w-full h-full" />
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shrink-0">
             <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-amber-900">
               Manajemen Hak Akses
            </h3>
            <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-amber-900/70">
               Permissions menentukan fitur apa saja yang dapat diakses oleh user. Setiap role dapat memiliki kumpulan permission yang berbeda. 
               <b> SuperAdmin</b> selalu memiliki hak akses penuh ke seluruh fitur.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
        <DataTable
          columns={columns}
          data={roles}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Cari role..."
        />
      </div>

      {/* Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-indigo-600 text-white text-left">
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">
              {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 font-medium opacity-90">
              Tentukan nama role dan pilih hak akses yang akan diberikan.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Nama Role</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Misal: Editor Berita"
                className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Permissions ({formData.selectedPermissions.length})</Label>
                <div className="flex gap-2">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50"
                    onClick={() => setFormData({...formData, selectedPermissions: permissions.map(p => p.name)})}
                   >
                     Select All
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50"
                    onClick={() => setFormData({...formData, selectedPermissions: []})}
                   >
                     Clear
                   </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {permissions.map((perm) => (
                  <div 
                    key={perm.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      formData.selectedPermissions.includes(perm.name)
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => togglePermission(perm.name)}
                  >
                    <div className="flex items-center gap-3">
                       <Lock className={`w-4 h-4 ${formData.selectedPermissions.includes(perm.name) ? 'text-indigo-500' : 'text-gray-300'}`} />
                       <span className="text-sm font-bold tracking-tight">{perm.name}</span>
                    </div>
                    <Checkbox 
                      checked={formData.selectedPermissions.includes(perm.name)}
                      onCheckedChange={() => togglePermission(perm.name)}
                      className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
              className="font-bold text-gray-500 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={isLoading}
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 grow sm:grow-0"
            >
              {isLoading ? 'Menyimpan...' : (editingRole ? 'Update Role' : 'Simpan Role')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Registered Roles', value: roles.length, icon: Shield, color: 'text-indigo-600' },
            { label: 'Available Permissions', value: permissions.length, icon: Lock, color: 'text-amber-500' },
            { label: 'Policy Coverage', value: '100%', icon: CheckCircle, color: 'text-emerald-500' },
          ].map((stat, i) => (
             <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                 </div>
                 <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-8 h-8 opacity-40 ${stat.color}`} />
                 </div>
             </div>
          ))}
       </div>
    </div>
  );
}
