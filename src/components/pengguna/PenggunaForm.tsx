"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
    getAdministratorById, 
    getLecturerById, 
    addAdministrator, 
    editAdministrator, 
    addLecturer, 
    editLecturer 
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, Save, User, Shield, Briefcase, 
    GraduationCap, BookOpen, Upload, Layout, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

const adminSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  division: z.string().min(2, 'Divisi wajib diisi'),
  role: z.string().min(3, 'Jabatan wajib diisi'),
});

const lecturerSchema = z.object({
  lecturerName: z.string().min(3, 'Nama minimal 3 karakter'),
  organizationalRole: z.string().min(2, 'Spesialisasi wajib diisi'),
  roles: z.string().min(3, 'Jabatan organisasi wajib diisi, pisahkan dengan koma'),
  degrees: z.string().min(2, 'Gelar wajib diisi, pisahkan dengan koma'),
});

interface PenggunaFormProps {
  id?: string;
}

export function PenggunaForm({ id }: PenggunaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'foundation';
  
  const isEdit = !!id;
  const [activeType, setActiveType] = useState(typeParam);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: '', division: '', role: '' }
  });

  const lecturerForm = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: { lecturerName: '', organizationalRole: '', roles: '', degrees: '' }
  });

  useEffect(() => {
    if (isEdit && id) {
      loadData(parseInt(id));
    }
  }, [id, isEdit, activeType]);

  const loadData = async (uid: number) => {
    try {
      if (activeType === 'foundation') {
        const data = await getAdministratorById(uid);
        if (data) adminForm.reset({ name: data.name, division: data.division, role: data.role });
      } else {
        const data = await getLecturerById(uid);
        if (data) {
          lecturerForm.reset({
            lecturerName: data.lecturerName,
            organizationalRole: data.organizationalRole,
            roles: data.roles?.join(', ') || '',
            degrees: data.degrees?.join(', ') || ''
          });
          if (data.lecturerImagePath) setPreviewUrl(getImageUrl(data.lecturerImagePath, 'lecturers'));
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data profil');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (activeType === 'foundation') {
          const payload = { ...data, id: isEdit ? parseInt(id!) : undefined };
          if (isEdit) await editAdministrator(payload);
          else await addAdministrator(payload);
      } else {
          const formData = new FormData();
          if (isEdit) formData.append('Id', id!);
          formData.append('LecturerName', data.lecturerName);
          formData.append('OrganizationalRole', data.organizationalRole);
          data.roles.split(',').forEach((r: string) => formData.append('Roles', r.trim()));
          data.degrees.split(',').forEach((d: string) => formData.append('Degrees', d.trim()));
          if (selectedFile) formData.append('LecturerImage', selectedFile);

          if (isEdit) await editLecturer(formData);
          else await addLecturer(formData);
      }
      toast.success('Data berhasil disimpan');
      router.push(`/admin/pengguna?tab=${activeType === 'foundation' ? 'foundation' : 'lecturer'}`);
    } catch (error) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/pengguna')} className="rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            {activeType === 'foundation' ? <Star className="w-8 h-8 text-amber-500" /> : <GraduationCap className="w-8 h-8 text-emerald-500" />}
            {isEdit ? 'Edit Profil' : 'Tambah Profil'}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Manajemen data {activeType === 'foundation' ? 'Pengurus Yayasan' : 'Dosen Akademik'}.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 max-w-4xl mx-auto">
        <form onSubmit={activeType === 'foundation' ? adminForm.handleSubmit(onSubmit) : lecturerForm.handleSubmit(onSubmit)} className="space-y-8 text-left">
          {activeType === 'foundation' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...adminForm.register('name')} className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none text-lg font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Divisi / Unit</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...adminForm.register('division')} className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <Input {...adminForm.register('role')} className="h-14 pl-12 rounded-2xl bg-gray-50/50 border-none font-bold" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 md:col-span-1">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Dosen</label>
                    <Input {...lecturerForm.register('lecturerName')} className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Spesialisasi</label>
                    <Input {...lecturerForm.register('organizationalRole')} className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gelar (Pisahkan koma)</label>
                    <Input {...lecturerForm.register('degrees')} placeholder="S.Kom, M.T" className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan Organisasi (Pisahkan koma)</label>
                    <Input {...lecturerForm.register('roles')} placeholder="Ketua, Kaprodi, Dosen Tetap" className="h-14 bg-gray-50/50 border-none rounded-2xl font-bold" />
                 </div>
              </div>
              <div className="md:col-span-1 space-y-4">
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Foto Profil</label>
                 <div className="aspect-square rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden relative group">
                    <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setSelectedFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                        }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                            <Upload className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Pilih Gambar</p>
                        </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-50">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl px-8 h-12 font-bold text-gray-400">Batalkan</Button>
            <Button type="submit" className="rounded-xl px-12 h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-3">
              <Save className="w-5 h-5" />
              Simpan Profil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
