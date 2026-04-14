"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Shield, Plus, Key, Search, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { getAllUsers, deleteUser, getAllRoles, updateUser } from '@/lib/api';
import { ROLE_PERMISSIONS } from '@/lib/permissions';

// Import local components
import { UserEditDialog } from '@/components/user/UserEditDialog';
import { getUserColumns, CMSUserDTO } from '@/components/user/UserColumns';
import { UserStats } from '@/components/user/UserStats';

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
  const [pageSize, setPageSize] = useState(10); // Changed to 10 for pagination if needed
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    loadUsers();
    fetchRolesAndPermissions();
  }, [pageIndex, pageSize]);

  const loadUsers = async (searchOverride?: string) => {
    try {
      setIsLoading(true);
      const search = searchOverride !== undefined ? searchOverride : searchTerm;
      const data = await getAllUsers(pageIndex, pageSize, search);
      const rawUsers = data.items || data.Items || [];
      
      const mappedUsers: CMSUserDTO[] = rawUsers.map((u: any) => ({
        id: u.id || u.Id,
        fullName: u.fullName || u.FullName,
        email: u.email || u.Email,
        isActive: u.isActive !== undefined ? u.isActive : u.IsActive,
        lastLoginAt: u.lastLoginAt || u.LastLoginAt,
        createdAt: u.createdAt || u.CreatedAt,
        roles: u.roles || u.Roles || [],
        permissions: u.permissions || u.Permissions || []
      }));

      setUsers(mappedUsers);
      setTotalItems(data.totalUsers || data.TotalUsers || data.totalCount || data.TotalCount || rawUsers.length);
      setPageCount(data.totalPages || data.TotalPages || 1);
    } catch (error) {
      toast.error('Gagal mengambil data user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      loadUsers(searchTerm);
    }
  };

  const fetchRolesAndPermissions = async () => {
    // ... same as before
    try {
      const data = await getAllRoles();
      const rolesList = data.items || data.Items || data;
      if (Array.isArray(rolesList)) {
        setRoles(rolesList.map((r: any) => typeof r === 'string' ? r : (r.name || r.roleName)));
        const map: Record<string, string[]> = { ...ROLE_PERMISSIONS };
        rolesList.forEach((r: any) => {
          const name = typeof r === 'string' ? r : (r.name || r.roleName);
          const perms = r.rolePermissions || r.Permissions || [];
          map[name] = Array.from(new Set([...(map[name] || []), ...perms]));
        });
        setRolePermissionsMap(map);
      }
    } catch (error) {
      console.warn('Roles endpoint error, using fallback roles.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }
    
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
    if (!selectedUser) {
      return;
    }
    
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

  const columns = getUserColumns({
    rolePermissionsMap,
    onEdit: handleEditClick,
    onDelete: handleDelete
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-primary">
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
              placeholder="Tekan Enter untuk cari..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 rounded-2xl h-11 border-gray-200 bg-white focus:ring-indigo-600/20"
            />
          </div>
          <Button 
            onClick={() => router.push('/admin/user/create')}
            className="h-11 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-200 flex items-center gap-3 transition-all"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
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
            <h3 className="text-xl font-black tracking-tight text-indigo-900">Otoritas & Hak Akses</h3>
            <p className="text-sm mt-1 font-medium leading-relaxed max-w-2xl text-indigo-700/80">
               Setiap role memiliki kumpulan <b>Permissions</b> (hak akses) spesifik. Di bawah ini ditampilkan gabungan permission dari role dan permission yang diberikan langsung ke user.
            </p>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-left">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          totalItems={totalItems}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(page) => setPageIndex(page)}
        />
      </div>

      <UserEditDialog 
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        selectedUser={selectedUser}
        editData={editData}
        setEditData={setEditData}
        roles={roles}
        isLoading={isLoading}
        onSave={handleUpdateUser}
      />
      
      <UserStats users={users} />
    </div>
  );
}
