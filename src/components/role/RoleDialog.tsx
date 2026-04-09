"use client";

import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface RoleDTO {
  id: number;
  name: string;
  rolePermissions: string[];
}

interface PermissionDTO {
  id: number;
  name: string;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: RoleDTO | null;
  roleFormData: {
    name: string;
    selectedPermissions: string[];
  };
  setRoleFormData: (data: any) => void;
  permissions: PermissionDTO[];
  isLoading: boolean;
  onSave: () => Promise<void>;
  togglePermissionInRole: (permName: string) => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  editingRole,
  roleFormData,
  setRoleFormData,
  permissions,
  isLoading,
  onSave,
  togglePermissionInRole,
}: RoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <label 
                  key={perm.id} 
                  htmlFor={`perm-${perm.id}`}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    roleFormData.selectedPermissions.includes(perm.name)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-md'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-colors ${roleFormData.selectedPermissions.includes(perm.name) ? 'bg-indigo-300/20' : 'bg-gray-100'}`}>
                         <Lock className={`w-4 h-4 ${roleFormData.selectedPermissions.includes(perm.name) ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                     <span className="text-sm font-black tracking-tight">{perm.name}</span>
                  </div>
                  <Checkbox 
                    id={`perm-${perm.id}`}
                    checked={roleFormData.selectedPermissions.includes(perm.name)}
                    onCheckedChange={() => togglePermissionInRole(perm.name)}
                    className="h-6 w-6 border-2 border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-lg"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="font-black uppercase tracking-widest text-[11px] text-gray-500 hover:bg-gray-100 h-14"
          >
            Batal
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isLoading}
            className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-indigo-200 grow sm:grow-0 transition-all active:scale-95"
          >
            {isLoading ? 'Processing...' : (editingRole ? 'Update Role' : 'Create Role')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
