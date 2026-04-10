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
import { Trash2 } from 'lucide-react';
import { AkademikDTO } from './AcademicColumns';

interface AcademicDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProgram: AkademikDTO | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function AcademicDeleteDialog({
  isOpen,
  onOpenChange,
  selectedProgram,
  onConfirm,
  isLoading = false,
}: AcademicDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-md">
        <div className="bg-red-500 h-2 w-full" />
        <div className="p-10 space-y-8 text-left">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-100">
              <Trash2 className="w-10 h-10" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Hapus Data?</DialogTitle>
              <DialogDescription className="font-bold text-gray-500 pt-3 text-base">
                Anda akan menghapus program <span className="text-red-600 leading-relaxed font-black">"{selectedProgram?.programName}"</span> secara permanen.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 font-primary">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-2xl font-black text-gray-500 border-none bg-gray-50 hover:bg-gray-100 transition-all uppercase tracking-widest text-[11px]"
              disabled={isLoading}
            >
              Batalkan
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1 h-14 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[11px]"
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Konfirmasi Hapus"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
