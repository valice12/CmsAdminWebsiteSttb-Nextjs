"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GenericCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: { id?: number; categoryName: string } | null;
  onSave: (name: string) => Promise<void>;
  title: {
    add: string;
    edit: string;
  };
  description: string;
  label: string;
  isLoading?: boolean;
  colorTheme?: "blue" | "emerald";
}

export function GenericCategoryDialog({
  isOpen,
  onOpenChange,
  selectedCategory,
  onSave,
  title,
  description,
  label,
  isLoading = false,
  colorTheme = "blue",
}: GenericCategoryDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(selectedCategory?.categoryName || "");
    }
  }, [isOpen, selectedCategory]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }
    await onSave(name);
  };

  const themeClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
  }[colorTheme];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-10 gap-8 border-none shadow-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-black text-navy tracking-tight leading-none">
            {selectedCategory?.id ? title.edit : title.add}
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {label}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akademik & Kampus"
              className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold shadow-inner focus:bg-white transition-all underline-offset-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:justify-start">
          <Button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
            className={cn(
              "h-14 rounded-2xl text-white font-black px-8 shadow-xl flex-1 uppercase tracking-widest transition-all",
              themeClasses
            )}
          >
            {isLoading ? "Menyimpan..." : "Simpan Kategori"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-14 rounded-2xl font-black text-gray-500 border-none bg-gray-100 hover:bg-gray-200 uppercase tracking-widest px-6"
          >
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
