"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserCircle, Mail, Clock, CheckCircle, XCircle, Trash2, Key, Activity, Plus, Edit, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { getAllUsers, deleteUser, getAllRoles, updateUser } from '@/lib/api';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CMSUserDTO {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  permissions: string[];
  roles: string[];
}

interface RoleInfo {
  name: string;
  permissions: string[];
}

export default function UserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<CMSUserDTO[]>([]);
  const [roles, setRoles] = useState<string[]>(['SuperAdmin', 'Admin', 'Staff', 'Editor', 'Lecturer']);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, string[]>>({});
  
  // Edit Role States
  const [selectedUser, setSelectedUser] = useState<CMSUserDTO | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState({
    selectedRoles: [] as string[],
    isActive: true
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadUsers();
    fetchRolesAndPermissions();
  }, [pageIndex, pageSize]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers(pageIndex, pageSize);
      const rawUsers = data.items || data.Items || [];
      setUsers(rawUsers.map((u: any) => ({
        id: u.id || u.Id,
        fullName: u.fullName || u.FullName,
        email: u.email || u.Email,
        isActive: u.isActive !== undefined ? u.isActive : u.IsActive,
        lastLoginAt: u.lastLoginAt || u.LastLoginAt,
        createdAt: u.createdAt || u.CreatedAt,
        roles: u.roles || u.Roles || [],
        permissions: u.permissions || u.Permissions || []
      })));
      setTotalItems(data.totalUsers || data.TotalUsers || data.totalCount || data.TotalCount || rawUsers.length);
      setPageCount(data.totalPages || data.TotalPages || 1);
    } catch (error) {
      toast.error('Gagal mengambil data user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRolesAndPermissions = async () => {
    try {
      const data = await getAllRoles();
      const rolesList = data.items || data.Items || data;
      if (Array.isArray(rolesList)) {
        setRoles(rolesList.map((r: any) => typeof r === 'string' ? r : (r.name || r.roleName)));
        
        // Map role name to its permissions
        const map: Record<string, string[]> = { ...ROLE_PERMISSIONS }; // Use hardcoded as base
        rolesList.forEach((r: any) => {
          const name = typeof r === 'string' ? r : (r.name || r.roleName);
          const perms = r.rolePermissions || r.Permissions || [];
          
          // Merge API perms with hardcoded perms (API wins/augments)
          map[name] = Array.from(new Set([...(map[name] || []), ...perms]));
        });
        setRolePermissionsMap(map);
      }
    } catch (error) {
      console.warn('Roles endpoint error, using fallback roles.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    
    try {
      setIsLoading(true);
      await deleteUser(id);
      toast.success('User berhasil dihapus');
      loadUsers();
    } catch (error) {
      toast.error('Gagal menghapus user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: CMSUserDTO) => {
    setSelectedUser(user);
    setEditData({
      selectedRoles: user.roles || [],
      isActive: user.isActive
    });
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      await updateUser({
        Id: selectedUser.id,
        FullName: selectedUser.fullName,
        Email: selectedUser.email,
        IsActive: editData.isActive,
        Roles: editData.selectedRoles,
        Permissions: selectedUser.permissions || []
      });
      toast.success('User updated successfully');
      setIsEditOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Gagal memperbarui user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<CMSUserDTO>[] = [
    {
      accessorKey: 'fullName',
      header: 'System User',
      cell: ({ row }) => (
        <div className="flex items-center gap-4 group text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm transition-all group-hover:scale-110">
            <UserCircle className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{row.original.fullName}</p>
            <div className="flex items-center gap-2 mt-0.5">
               <Mail className="w-3 h-3 text-muted-foreground" />
               <p className="text-[10px] text-muted-foreground font-medium">{row.original.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role, i) => (
            <Badge key={i} variant="outline" className="font-extrabold text-[9px] px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm">
              <Shield className="w-3 h-3 mr-1.5" />
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
        id: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => {
          const directPerms = row.original.permissions || [];
          const inheritedPerms = row.original.roles.flatMap(role => rolePermissionsMap[role] || []);
          const allPerms = Array.from(new Set([...directPerms, ...inheritedPerms]));
          
          if (allPerms.length === 0) return <span className="text-[10px] text-gray-400 italic">No specific permissions</span>;
          
          return (
            <div className="flex flex-wrap gap-1 max-w-[250px]">
              {allPerms.map((p, i) => (
                <Badge key={i} variant="outline" className="text-[8px] font-bold px-2 py-0 h-5 bg-gray-50 text-gray-500 border-gray-200">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  {p}
                </Badge>
              ))}
            </div>
          );
        },
      },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           {row.original.isActive ? (
             <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                <CheckCircle className="w-3 h-3 mr-1" /> ACTIVE
             </Badge>
           ) : (
             <Badge className="bg-red-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                <XCircle className="w-3 h-3 mr-1" /> INACTIVE
             </Badge>
           )}
        </div>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Activity',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-left">
           <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {row.original.lastLoginAt && row.original.lastLoginAt !== '0001-01-01T00:00:00' 
                ? new Date(row.original.lastLoginAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) 
                : 'Belum Login'}
           </div>
           <p className="text-[9px] text-gray-400 font-medium italic ml-5">Dibuat: {new Date(row.original.createdAt).toLocaleDateString()}</p>
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
            onClick={() => handleEditClick(row.original)}
            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Edit Role/Status"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toast.info("Reset password function not directly available")}
            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Hapus User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            User System
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Manajemen akun administrator dan hak akses fungsional CMS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64 text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari user system..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-indigo-600/20"
            />
          </div>
          <Button 
            onClick={() => router.push('/admin/user/create')}
            className="h-11 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-200 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Tambah System User
          </Button>
        </div>
      </div>

       {/* Security Note */}
       <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 flex items-start gap-6 text-left shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000 text-indigo-900">
             <Activity className="w-full h-full" />
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shrink-0">
             <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-indigo-900">
               Otoritas & Hak Akses
            </h3>
            <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-indigo-700/80">
               Setiap role memiliki kumpulan <b>Permissions</b> (hak akses) spesifik. Di bawah ini ditampilkan gabungan permission dari role dan permission yang diberikan langsung ke user.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          globalFilter={searchTerm}
          onGlobalFilterChange={setSearchTerm}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update User: {selectedUser?.fullName}</DialogTitle>
            <DialogDescription>
              Ubah role atau status aktifasi user system ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Roles / Hak Akses ({editData.selectedRoles.length})</Label>
              <ScrollArea className="h-[200px] border rounded-2xl p-4 bg-gray-50/50 shadow-inner">
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div 
                      key={role} 
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-all cursor-pointer group shadow-sm border border-transparent hover:border-indigo-100"
                      onClick={(e) => {
                        e.preventDefault();
                        const isSelected = editData.selectedRoles.includes(role);
                        setEditData(prev => ({
                          ...prev,
                          selectedRoles: isSelected 
                            ? prev.selectedRoles.filter(r => r !== role)
                            : [...prev.selectedRoles, role]
                        }));
                      }}
                    >
                      <Checkbox 
                        id={`role-${role}`} 
                        checked={editData.selectedRoles.includes(role)} 
                        className="h-5 w-5 border-2 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <label 
                        htmlFor={`role-${role}`}
                        className="text-xs font-black leading-none cursor-pointer grow text-gray-600 group-hover:text-indigo-600"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Status Akun</Label>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                    {editData.isActive ? 'User dapat melakukan login' : 'Akses user dibekukan'}
                  </p>
               </div>
               <Switch 
                 checked={editData.isActive} 
                 onCheckedChange={(val) => setEditData({...editData, isActive: val})}
               />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button 
              onClick={handleUpdateUser} 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Technical Stats Overlay */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Accounts', value: users.length, icon: Shield, color: 'text-indigo-600' },
            { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'Avg Activity', value: 'High', icon: Activity, color: 'text-amber-500' },
            { label: 'System Health', value: '100%', icon: CheckCircle, color: 'text-emerald-500' },
          ].map((stat, i) => (
             <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                 </div>
                 <stat.icon className={`w-10 h-10 opacity-10 ${stat.color}`} />
             </div>
          ))}
       </div>
    </div>
  );
}
