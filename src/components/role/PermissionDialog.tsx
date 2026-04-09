"use client";

import { AlertTriangle } from 'lucide-react';
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

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permFormData: {
    name: string;
  };
  setPermFormData: (data: { name: string }) => void;
  onSave: () => Promise<void>;
}

export function PermissionDialog({
  open,
  onOpenChange,
  permFormData,
  setPermFormData,
  onSave,
}: PermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="font-black uppercase tracking-widest text-[11px] text-gray-500 hover:bg-gray-100 h-14"
          >
            Batal
          </Button>
           <Button 
              onClick={onSave} 
              className="h-14 px-10 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-amber-200 transition-all active:scale-95"
           >
              Save Key
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
