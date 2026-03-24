"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCostById, addCost, editCost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, DollarSign, Tag, GraduationCap, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const costSchema = z.object({
  categoryName: z.string().min(2, 'Kategori wajib diisi'),
  programName: z.string().min(2, 'Nama program wajib diisi'),
  costName: z.string().min(2, 'Nama biaya wajib diisi'),
  cost: z.coerce.number().min(0, 'Biaya tidak boleh negatif'),
});

type CostFormData = z.infer<typeof costSchema>;

interface BiayaFormProps {
  id?: string;
}

export function BiayaForm({ id }: BiayaFormProps) {
  const router = useRouter();
  const isEdit = !!id;

  const form = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      categoryName: '',
      programName: '',
      costName: '',
      cost: 0,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCost(parseInt(id));
    }
  }, [id, isEdit]);

  const loadCost = async (costId: number) => {
    try {
      const data = await getCostById(costId);
      if (data) {
        form.reset({
          categoryName: data.categoryName,
          programName: data.programName,
          costName: data.costName,
          cost: data.cost,
        });
      }
    } catch (error) {
      toast.error('Gagal memuat data biaya');
    }
  };

  const onSubmit = async (data: CostFormData) => {
    try {
      const payload = { ...data, id: isEdit ? parseInt(id!) : undefined };
      if (isEdit) {
        await editCost(payload);
        toast.success('Data biaya berhasil diperbarui');
      } else {
        await addCost(payload);
        toast.success('Data biaya berhasil ditambahkan');
      }
      router.push('/admin/biaya');
      router.refresh();
    } catch (error) {
      toast.error('Gagal menyimpan data biaya');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/biaya')} className="rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-500" />
            {isEdit ? 'Edit Rincian Biaya' : 'Tambah Rincian Biaya'}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Konfigurasi tarif biaya kuliah dan rincian administratif.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 max-w-2xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kategori (e.g. Mahasiswa Baru)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...form.register('categoryName')} placeholder="Kategori biaya..." className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none text-base font-bold" />
                </div>
                {form.formState.errors.categoryName && <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.categoryName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Program / Jurusan</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...form.register('programName')} placeholder="Nama program atau 'Semua Program'..." className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none text-base font-bold" />
                </div>
                {form.formState.errors.programName && <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.programName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Biaya</label>
                <div className="relative">
                  <FileSpreadsheet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...form.register('costName')} placeholder="Contoh: Biaya Pendaftaran, SPP..." className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none text-base font-bold" />
                </div>
                {form.formState.errors.costName && <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.costName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah Biaya (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-500">Rp</span>
                  <Input type="number" {...form.register('cost')} className="h-14 pl-12 rounded-2xl bg-amber-50/30 border-none text-lg font-black text-amber-600" />
                </div>
                {form.formState.errors.cost && <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.cost.message}</p>}
              </div>
           </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-50">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/biaya')} className="rounded-xl px-8 h-12 font-bold text-gray-400">Batalkan</Button>
            <Button type="submit" isLoading={form.formState.isSubmitting} className="rounded-xl px-12 h-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-3">
              <Save className="w-5 h-5" />
              Simpan Data
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
