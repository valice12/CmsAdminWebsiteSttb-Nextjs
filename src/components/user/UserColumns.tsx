"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  UserCircle, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Key, 
  Edit, 
  Lock 
} from 'lucide-react';
import { toast } from 'sonner';

export interface CMSUserDTO {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  permissions: string[];
  roles: string[];
}

interface ColumnProps {
  rolePermissionsMap: Record<string, string[]>;
  onEdit: (user: CMSUserDTO) => void;
  onDelete: (id: number) => void;
}

export const getUserColumns = ({ rolePermissionsMap, onEdit, onDelete }: ColumnProps): ColumnDef<CMSUserDTO>[] => [
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
        
        if (allPerms.length === 0) {
          return <span className="text-[10px] text-gray-400 italic">No specific permissions</span>;
        }
        
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
          onClick={() => onEdit(row.original)}
          className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          title="Edit Role/Status"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(row.original.id)}
          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Hapus User"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
