"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CMSUserDTO {
  id: number;
  fullName: string;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: CMSUserDTO | null;
  editData: {
    selectedRoles: string[];
    isActive: boolean;
  };
  setEditData: (data: any) => void;
  roles: string[];
  isLoading: boolean;
  onSave: () => Promise<void>;
}

export function UserEditDialog({
  open,
  onOpenChange,
  selectedUser,
  editData,
  setEditData,
  roles,
  isLoading,
  onSave,
}: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update User: {selectedUser?.fullName}</DialogTitle>
          <DialogDescription>
            Ubah role atau status aktifasi user system ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role / Hak Akses Utama</Label>
            <ScrollArea className="h-[200px] border rounded-2xl p-4 bg-gray-50/50 shadow-inner">
              <div className="space-y-3">
                {roles.map((role) => (
                  <label 
                    key={role} 
                    htmlFor={`role-${role}`}
                    className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-all cursor-pointer group shadow-sm border border-transparent ${
                      editData.selectedRoles.includes(role) ? 'border-indigo-100 bg-white' : ''
                    }`}
                  >
                    <Checkbox 
                      id={`role-${role}`} 
                      checked={editData.selectedRoles.includes(role)} 
                      onCheckedChange={() => {
                        setEditData((prev: any) => ({
                          ...prev,
                          selectedRoles: [role]
                        }));
                      }}
                      className="h-5 w-5 border-2 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <span 
                      className={`text-xs font-black leading-none cursor-pointer grow transition-colors ${
                        editData.selectedRoles.includes(role) ? 'text-indigo-600' : 'text-gray-600'
                      }`}
                    >
                      {role}
                    </span>
                  </label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button 
            onClick={onSave} 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
