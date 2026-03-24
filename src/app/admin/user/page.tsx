"use client";

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserCircle, Mail, Clock, CheckCircle, XCircle, Trash2, Key, Activity, Info, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SystemUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
}

export default function UserPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data as backend endpoint for System Users is not yet available in controllers
  const [users] = useState<SystemUser[]>([
    {
      id: 1,
      fullName: 'Super Administrator',
      email: 'admin@sttb.ac.id',
      role: 'Super Admin',
      isActive: true,
      lastLogin: new Date().toISOString(),
    }
  ]);

  const columns: ColumnDef<SystemUser>[] = [
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
      accessorKey: 'role',
      header: 'Access Level',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-extrabold uppercase tracking-widest text-[9px] px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm">
          <Shield className="w-3 h-3 mr-1.5" />
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           {row.original.isActive ? (
             <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
             </Badge>
           ) : (
             <Badge className="bg-red-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                <XCircle className="w-3 h-3 mr-1" /> Inactive
             </Badge>
           )}
        </div>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Activity',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
           <Clock className="w-3.5 h-3.5 text-gray-400" />
           {new Date(row.original.lastLogin).toLocaleDateString('id-ID', {
               day: '2-digit',
               month: 'short',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           })}
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
            onClick={() => toast.info("Resetting password...")}
            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Key className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toast.warning("Endpoint Delete System User Belum Tersedia")}
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
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
        <Button 
          onClick={() => toast.warning("Endpoint Create User Belum Tersedia")}
          className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-200"
        >
          Add System User
        </Button>
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
               Halaman ini mengelola akun yang memiliki akses ke dashboard CMS. Pastikan setiap akun memiliki <b>Email Institusi</b> yang valid dan level akses yang sesuai dengan tanggung jawabnya.
            </p>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-left p-2">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          searchKey="fullName"
          searchPlaceholder="Cari user system..."
        />
      </div>

       {/* Technical Stats Overlay */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Accounts', value: users.length, icon: UsersIcon, color: 'text-gray-900' },
            { label: 'Super Admins', value: 1, icon: Shield, color: 'text-indigo-600' },
            { label: 'Avg Activity', value: 'High', icon: Activity, color: 'text-emerald-500' },
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
