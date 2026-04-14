"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { Key, UserCircle, Mail } from 'lucide-react';

interface CMSUserDTO {
  id: number;
  fullName: string;
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: CMSUserDTO | null;
  editData: {
    fullName: string;
    email: string;
    newPassword: string;
    confirmNewPassword: string;
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const errors = {
    fullName: isSubmitted && !editData.fullName.trim(),
    email: isSubmitted && !editData.email.trim(),
    role: isSubmitted && editData.selectedRoles.length === 0,
    passwordMatch: editData.confirmNewPassword && editData.newPassword !== editData.confirmNewPassword
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 uppercase">Edit Profile: {selectedUser?.fullName}</DialogTitle>
          <DialogDescription className="font-medium text-gray-500">
            Perbarui identitas, kredensial, dan hak akses user system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Identity Section */}
          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Lengkap</Label>
                <div className="relative group">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                   <Input 
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    placeholder="Nama lengkap user..."
                    className={`pl-10 h-11 border-2 font-bold transition-all shadow-inner ${
                      errors.fullName 
                      ? 'bg-red-50/50 border-red-500' 
                      : 'bg-gray-50/50 border-gray-100 focus:bg-white'
                    }`}
                  />
                </div>
             </div>
             <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email / Akun Login</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                   <Input 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    placeholder="email@sttb.ac.id"
                    className={`pl-10 h-11 border-2 font-bold transition-all shadow-inner ${
                      errors.email 
                      ? 'bg-red-50/50 border-red-500' 
                      : 'bg-gray-50/50 border-gray-100 focus:bg-white'
                    }`}
                  />
                </div>
             </div>
          </div>

          <div className="space-y-4 text-left">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role / Hak Akses Utama</Label>
             <ScrollArea className={`h-[200px] border-2 rounded-2xl p-4 shadow-inner transition-all ${
              errors.role 
              ? 'bg-red-50/30 border-red-500' 
              : 'bg-gray-50/50 border-gray-100'
            }`}>
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
             <div className="space-y-0.5 text-left">
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

          <div className="space-y-2 text-left pt-2 border-t border-gray-50 mt-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password Baru <span className="text-gray-300 normal-case font-medium">(kosongkan jika tidak ingin ganti)</span></Label>
            <div className="relative group">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                type="password"
                value={editData.newPassword}
                onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                placeholder="Min. 8 karakter..."
                className="pl-10 h-11 bg-indigo-50/20 border-indigo-100/50 rounded-xl font-bold focus:bg-white transition-all shadow-inner"
              />
            </div>
            <p className="text-[9px] text-gray-400 font-medium mt-1 leading-tight uppercase tracking-tighter italic">
              *Password akan langsung di-hash secara aman oleh sistem.
            </p>
          </div>

          {editData.newPassword.length > 0 && (
            <div className="space-y-2 text-left pt-2 animate-in slide-in-from-top-2 duration-300">
              <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Konfirmasi Password Baru</Label>
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input 
                  type="password"
                  value={editData.confirmNewPassword}
                  onChange={(e) => setEditData({...editData, confirmNewPassword: e.target.value})}
                  placeholder="Ulangi password baru..."
                  className={`pl-10 h-11 border-indigo-200 rounded-xl font-bold focus:bg-white transition-all shadow-md ${
                    editData.confirmNewPassword && editData.newPassword !== editData.confirmNewPassword 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white'
                  }`}
                />
              </div>
              {editData.confirmNewPassword && editData.newPassword !== editData.confirmNewPassword && (
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1 ml-1">
                  Password tidak cocok
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button 
            onClick={() => {
               setIsSubmitted(true);
               if (!editData.fullName.trim() || !editData.email.trim()) {
                 toast.error('Nama dan Email wajib diisi');
                 return;
               }
               if (editData.selectedRoles.length === 0) {
                 toast.error('Setidaknya satu role harus dipilih');
                 return;
               }
               
               if (editData.newPassword) {
                  if (editData.newPassword.length < 8) {
                    toast.error('Password baru minimal 8 karakter');
                    return;
                  }
                  if (editData.newPassword !== editData.confirmNewPassword) {
                    toast.error('Konfirmasi password tidak cocok');
                    return;
                  }
               }
               
               onSave();
            }} 
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-200 transition-all"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-xl border-none bg-gray-100 hover:bg-gray-200 font-bold text-gray-500 uppercase text-[11px] tracking-widest px-6"
          >
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
