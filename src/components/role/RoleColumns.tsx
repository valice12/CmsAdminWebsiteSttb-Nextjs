"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Edit, 
  Trash2, 
  Lock, 
  Key
} from 'lucide-react';

export interface RoleDTO {
  id: number;
  name: string;
  rolePermissions: string[];
  createdAt: string;
}

export interface PermissionDTO {
  id: number;
  name: string;
  createdAt?: string;
}

interface ColumnProps {
  onEditRole: (role: RoleDTO) => void;
  onDeleteRole: (id: number, name: string) => void;
  onDeletePermission: (id: number, name: string) => void;
}

export const getRoleColumns = ({ onEditRole, onDeleteRole }: Pick<ColumnProps, 'onEditRole' | 'onDeleteRole'>): ColumnDef<RoleDTO>[] => [
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
          onClick={() => onEditRole(row.original)}
        >
          <Edit className="w-4.5 h-4.5" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-9 w-9 text-red-500 hover:bg-red-50"
          onClick={() => onDeleteRole(row.original.id, row.original.name)}
        >
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      </div>
    ),
  }
];

export const getPermissionColumns = ({ onDeletePermission }: Pick<ColumnProps, 'onDeletePermission'>): ColumnDef<PermissionDTO>[] => [
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
          onClick={() => onDeletePermission(row.original.id, row.original.name)}
        >
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      </div>
    ),
  }
];
