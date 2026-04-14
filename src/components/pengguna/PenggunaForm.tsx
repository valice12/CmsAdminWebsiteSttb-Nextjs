"use client";

import { useState, useEffect, useMemo } from 'react';
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
  editLecturer,
  registerUser,
  getUserById,
  updateUser,
  getAllRoles
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Save, User, Shield, Briefcase,
  GraduationCap, BookOpen, Upload, Layout, Star,
  Mail, Lock, UserPlus, ShieldCheck, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

const adminSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  division: z.string().min(2, 'Divisi wajib diisi'),
  role: z.string().optional(),
});

const lecturerSchema = z.object({
  lecturerName: z.string().min(3, 'Nama minimal 3 karakter'),
  organizationalRole: z.string().min(2, 'Jabatan mengajar wajib diisi'),
  joinedAt: z.string().min(1, 'Tanggal bergabung wajib diisi'),
  roles: z.string().min(3, 'Jabatan organisasi wajib diisi, pisahkan dengan koma'),
  degrees: z.string().min(2, 'Gelar wajib diisi, pisahkan dengan koma'),
});

interface PenggunaFormProps {
  id?: string;
  type?: string;
}

export function PenggunaForm({ id, type }: PenggunaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = type || searchParams.get('type') || 'foundation';

  const isEdit = !!id;
  const [activeType, setActiveType] = useState(typeParam);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>(['SuperAdmin', 'Admin', 'Staff', 'Editor', 'Lecturer']);

  // Dynamic user schema for password validation
  const userSchema = useMemo(() => z.object({
    fullName: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    roleNames: z.array(z.string()).min(1, 'Role wajib diisi'),
    password: isEdit
      ? z.string().optional().or(z.literal(''))
      : z.string().min(8, 'Password wajib diisi minimal 8 karakter'),
    confirmPassword: z.string().optional().or(z.literal('')),
  }).superRefine(({ password, confirmPassword }, ctx) => {
    // For Create: Password is required and must match
    if (!isEdit) {
      if (!password || password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password wajib diisi minimal 8 karakter',
          path: ['password'],
        });
      }
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Konfirmasi password tidak cocok',
          path: ['confirmPassword'],
        });
      }
    }
    // For Edit: If password is provided, it must be min 8 and match confirm
    else if (password && password.length > 0) {
      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password minimal 8 karakter',
          path: ['password'],
        });
      }
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Konfirmasi password tidak cocok',
          path: ['confirmPassword'],
        });
      }
    }
  }), [isEdit]);

  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: '', division: '', role: '' }
  });

  const lecturerForm = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      lecturerName: '',
      organizationalRole: '',
      joinedAt: new Date().toISOString().slice(0, 10),
      roles: '',
      degrees: ''
    }
  });

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { fullName: '', email: '', roleNames: ['Admin'], password: '', confirmPassword: '' }
  });

  useEffect(() => {
    if (isEdit && id) {
      loadData(parseInt(id));
    }
  }, [id, isEdit, activeType]);

  useEffect(() => {
    if (activeType === 'user') {
      fetchRoles();
    }
  }, [activeType]);

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      const rolesList = data.items || data.Items || data;
      if (Array.isArray(rolesList)) {
        setRoles(rolesList.map((r: any) => typeof r === 'string' ? r : (r.name || r.roleName)));
      }
    } catch (error) {
      console.warn('Roles endpoint error, using fallback roles.');
    }
  };

  const loadData = async (uid: number) => {
    try {
      if (activeType === 'foundation') {
        const data = await getAdministratorById(uid);
        if (data) adminForm.reset({ name: data.name, division: data.division, role: data.role });
      } else if (activeType === 'lecturer') {
        const data = await getLecturerById(uid);
        if (data) {
          lecturerForm.reset({
            lecturerName: data.lecturerName,
            organizationalRole: data.organizationalRole,
            joinedAt: data.joinedAt ? new Date(data.joinedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            roles: data.roles?.join(', ') || '',
            degrees: data.degrees?.join(', ') || ''
          });
          if (data.lecturerImagePath) setPreviewUrl(getImageUrl(data.lecturerImagePath, 'lecturers'));
        }
      } else if (activeType === 'user') {
        const data = await getUserById(uid);
        if (data) {
          userForm.reset({
            fullName: data.fullName,
            email: data.email,
            roleNames: data.roles || ['Admin'],
            password: '',
            confirmPassword: ''
          });
        }
      }
    } catch (error) {
      toast.error('Gagal memuat data profil');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (activeType === 'foundation') {
        // If not Dewan Pengurus, role is defaulted to division name or "Anggota"
        const finalRole = data.division === 'Dewan Pengurus' ? (data.role || 'Anggota') : data.division;
        const payload = { ...data, role: finalRole, id: isEdit ? parseInt(id!) : undefined };
        if (isEdit) await editAdministrator(payload);
        else await addAdministrator(payload);
      } else if (activeType === 'lecturer') {
        const formData = new FormData();
        if (isEdit) formData.append('Id', id!);
        formData.append('LecturerName', data.lecturerName);
        // Multi-value array for OrganizationalRole
        const teachingRoles = data.organizationalRole.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        teachingRoles.forEach((role: string) => formData.append('OrganizationalRole', role));

        formData.append('JoinedAt', new Date(data.joinedAt).toISOString());
        data.roles.split(',').forEach((r: string) => formData.append('Roles', r.trim()));
        data.degrees.split(',').forEach((d: string) => formData.append('Degrees', d.trim()));
        if (selectedFile) formData.append('LecturerImage', selectedFile);

        if (isEdit) await editLecturer(formData);
        else await addLecturer(formData);
      } else {
        // User type
        if (isEdit) {
          await updateUser({
            Id: parseInt(id!),
            FullName: data.fullName,
            Email: data.email,
            IsActive: true,
            NewPassword: data.password || undefined,
            Roles: data.roleNames,
            Permissions: []
          });
        } else {
          await registerUser({
            ...data,
            roleName: data.roleNames[0]
          });
        }
      }
      toast.success('Data berhasil disimpan');

      if (activeType === 'foundation') router.push('/admin/pengurus-yayasan');
      else if (activeType === 'lecturer') router.push('/admin/dosen');
      else router.push('/admin/user');

    } catch (error) {
      toast.error('Gagal menyimpan data');
      console.error(error);
    }
  };

  const onInvalid = (errors: any) => {
    console.dir(errors);
    toast.error('Penyimpanan gagal. Harap lengkapi semua bidang yang wajib diisi.');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-primary">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(activeType === 'foundation' ? '/admin/pengurus-yayasan' : '/admin/dosen')} className="rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            {activeType === 'foundation' ? <Star className="w-8 h-8 text-amber-500" /> : (activeType === 'lecturer' ? <GraduationCap className="w-8 h-8 text-emerald-500" /> : <ShieldCheck className="w-8 h-8 text-indigo-500" />)}
            {isEdit ? 'Edit Akun/Profil' : 'Tambah Akun/Profil'}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Manajemen data {activeType === 'foundation' ? 'Pengurus Yayasan' : (activeType === 'lecturer' ? 'Dosen Akademik' : 'User Akun')}.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 max-w-4xl mx-auto">
        <form
          onSubmit={
            activeType === 'foundation' ? adminForm.handleSubmit(onSubmit, onInvalid) :
              (activeType === 'lecturer' ? lecturerForm.handleSubmit(onSubmit, onInvalid) : userForm.handleSubmit(onSubmit, onInvalid))
          }
          className="space-y-8 text-left"
        >
          {activeType === 'foundation' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <Input
                    {...adminForm.register('name')}
                    placeholder="Masukkan nama lengkap..."
                    className={`h-14 pl-12 rounded-2xl bg-gray-50 border-2 text-lg font-bold shadow-sm transition-all ${adminForm.formState.errors.name
                        ? 'border-red-500 bg-red-50/50'
                        : 'border-transparent bg-gray-50/50 focus:bg-white focus:border-amber-200 shadow-inner'
                      }`}
                  />
                </div>
                {adminForm.formState.errors.name && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                    {adminForm.formState.errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Divisi / Unit</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-amber-500 transition-colors" />
                  <Select
                    onValueChange={(val) => adminForm.setValue('division', val)}
                    value={adminForm.watch('division')}
                  >
                    <SelectTrigger className={`h-14 pl-12 rounded-2xl font-bold text-left shadow-sm transition-all border-2 ${adminForm.formState.errors.division
                        ? 'border-red-500 bg-red-50/50'
                        : 'bg-gray-50 border-transparent focus:ring-amber-500/20 focus:border-amber-200 focus:bg-white'
                      }`}>
                      <SelectValue placeholder="Pilih Divisi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                      <SelectItem value="Dewan Pengurus" className="font-bold py-3 px-4 focus:bg-amber-50 focus:text-amber-700 rounded-xl cursor-pointer">Dewan Pengurus</SelectItem>
                      <SelectItem value="Dewan Pembina" className="font-bold py-3 px-4 focus:bg-amber-50 focus:text-amber-700 rounded-xl cursor-pointer">Dewan Pembina</SelectItem>
                      <SelectItem value="Anggota" className="font-bold py-3 px-4 focus:bg-amber-50 focus:text-amber-700 rounded-xl cursor-pointer">Anggota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {adminForm.formState.errors.division && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                    {adminForm.formState.errors.division.message as string}
                  </p>
                )}
              </div>

              {adminForm.watch('division') === 'Dewan Pengurus' && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black text-amber-600 uppercase tracking-widest ml-1">Jabatan (Role)</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 z-10 group-focus-within:scale-110 transition-transform" />
                    <Select
                      onValueChange={(val) => adminForm.setValue('role', val)}
                      value={adminForm.watch('role')}
                    >
                      <SelectTrigger className={`h-14 pl-12 rounded-2xl font-bold text-left shadow-md transition-all text-amber-900 border-2 ${adminForm.formState.errors.role
                          ? 'border-red-500 bg-red-50/50'
                          : 'bg-amber-50 border-amber-100/50 focus:ring-amber-500/20 focus:bg-white'
                        }`}>
                        <SelectValue placeholder="Pilih Jabatan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-amber-100 shadow-2xl">
                        <SelectItem value="Ketua" className="font-bold py-3 px-4 focus:bg-amber-600 focus:text-white rounded-xl cursor-pointer">Ketua</SelectItem>
                        <SelectItem value="Wakil Ketua" className="font-bold py-3 px-4 focus:bg-amber-600 focus:text-white rounded-xl cursor-pointer">Wakil Ketua</SelectItem>
                        <SelectItem value="Sekretaris" className="font-bold py-3 px-4 focus:bg-amber-600 focus:text-white rounded-xl cursor-pointer">Sekretaris</SelectItem>
                        <SelectItem value="Bendahara" className="font-bold py-3 px-4 focus:bg-amber-600 focus:text-white rounded-xl cursor-pointer">Bendahara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {adminForm.formState.errors.role && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
                      {adminForm.formState.errors.role.message as string}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : activeType === 'lecturer' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 md:col-span-1">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Dosen</label>
                  <Input
                    {...lecturerForm.register('lecturerName')}
                    className={`h-14 rounded-2xl font-bold transition-all border-2 ${lecturerForm.formState.errors.lecturerName
                        ? 'bg-red-50/50 border-red-500'
                        : 'bg-gray-50/50 border-transparent focus:bg-white'
                      }`}
                  />
                  {lecturerForm.formState.errors.lecturerName && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{lecturerForm.formState.errors.lecturerName.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan Mengajar (Pisahkan koma)</label>
                  <Input
                    {...lecturerForm.register('organizationalRole')}
                    placeholder="e.g. Dosen Matematika, Dosen Fisika"
                    className={`h-14 rounded-2xl font-bold transition-all border-2 ${lecturerForm.formState.errors.organizationalRole
                        ? 'bg-red-50/50 border-red-500'
                        : 'bg-gray-50/50 border-transparent focus:bg-white'
                      }`}
                  />
                  {lecturerForm.formState.errors.organizationalRole && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{lecturerForm.formState.errors.organizationalRole.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Bergabung</label>
                  <Input
                    type="date"
                    {...lecturerForm.register('joinedAt')}
                    className={`h-14 rounded-2xl font-bold transition-all border-2 ${lecturerForm.formState.errors.joinedAt
                        ? 'bg-red-50/50 border-red-500'
                        : 'bg-gray-50/50 border-transparent focus:bg-white'
                      }`}
                  />
                  {lecturerForm.formState.errors.joinedAt && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{lecturerForm.formState.errors.joinedAt.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gelar (Pisahkan koma)</label>
                  <Input
                    {...lecturerForm.register('degrees')}
                    placeholder="S.Kom, M.T"
                    className={`h-14 rounded-2xl font-bold transition-all border-2 ${lecturerForm.formState.errors.degrees
                        ? 'bg-red-50/50 border-red-500'
                        : 'bg-gray-50/50 border-transparent focus:bg-white'
                      }`}
                  />
                  {lecturerForm.formState.errors.degrees && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{lecturerForm.formState.errors.degrees.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan Organisasi (Pisahkan koma)</label>
                  <Input
                    {...lecturerForm.register('roles')}
                    placeholder="Ketua, Kaprodi, Dosen Tetap"
                    className={`h-14 rounded-2xl font-bold transition-all border-2 ${lecturerForm.formState.errors.roles
                        ? 'bg-red-50/50 border-red-500'
                        : 'bg-gray-50/50 border-transparent focus:bg-white'
                      }`}
                  />
                  {lecturerForm.formState.errors.roles && (
                    <p className="text-[10px] text-red-500 font-bold ml-1">{lecturerForm.formState.errors.roles.message as string}</p>
                  )}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Pengguna</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <Input
                    {...userForm.register('fullName')}
                    placeholder="Masukkan nama lengkap..."
                    className={`h-14 pl-12 rounded-2xl text-lg font-bold transition-all border-2 ${userForm.formState.errors.fullName
                        ? 'border-red-500 bg-red-50/50'
                        : 'bg-indigo-50/30 border-transparent focus:bg-white shadow-inner'
                      }`}
                  />
                </div>
                {userForm.formState.errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{userForm.formState.errors.fullName.message as string}</p>}
              </div>
              <div className="space-y-2 md:col-span-2 sm:col-span-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email User</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <Input
                    type="email"
                    {...userForm.register('email')}
                    placeholder="email@sttb.ac.id"
                    className={`h-14 pl-12 rounded-2xl font-bold transition-all border-2 ${userForm.formState.errors.email
                        ? 'border-red-500 bg-red-50/50'
                        : 'bg-indigo-50/30 border-transparent focus:bg-white shadow-inner'
                      }`}
                  />
                </div>
                {userForm.formState.errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{userForm.formState.errors.email.message as string}</p>}
              </div>

              {/* Password Section */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <Input
                    type="password"
                    {...userForm.register('password')}
                    placeholder="Min. 8 karakter"
                    className={`h-14 pl-12 rounded-2xl font-bold transition-all border-2 ${userForm.formState.errors.password
                        ? 'border-red-500 bg-red-50/50'
                        : 'bg-indigo-50/30 border-transparent focus:bg-white shadow-inner'
                      }`}
                  />
                </div>
                {userForm.formState.errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{userForm.formState.errors.password.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ulangi Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <Input
                    type="password"
                    {...userForm.register('confirmPassword')}
                    placeholder="Konfirmasi password..."
                    className={`h-14 pl-12 rounded-2xl font-bold transition-all border-2 ${userForm.formState.errors.confirmPassword
                        ? 'border-red-500 bg-red-50/50'
                        : 'bg-indigo-50/30 border-transparent focus:bg-white shadow-inner'
                      }`}
                  />
                </div>
                {userForm.formState.errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{userForm.formState.errors.confirmPassword.message as string}</p>}
              </div>

              {/* Roles Section */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Role / Hak Akses Utama</label>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[9px] uppercase tracking-tighter">Pilih Satu</Badge>
                </div>
                <ScrollArea className="h-[250px] border border-gray-200/50 rounded-2xl p-6 bg-white shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const isSelected = userForm.watch('roleNames').includes(role);
                      return (
                        <label
                          key={role}
                          htmlFor={`form-role-${role}`}
                          className={`flex items-center space-x-3 p-2.5 px-5 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${isSelected
                              ? 'bg-indigo-50/20 border-indigo-600 shadow-sm ring-1 ring-indigo-500/10'
                              : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm'
                            }`}
                        >
                          <Checkbox
                            id={`form-role-${role}`}
                            checked={isSelected}
                            onCheckedChange={() => {
                              userForm.setValue('roleNames', [role]);
                            }}
                            className={`h-5 w-5 border-2 rounded-xl transition-all shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                              }`}
                          />
                          <div className="flex flex-col grow">
                            <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}>
                              {role}
                            </span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Level Fungsional</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
                {userForm.formState.errors.roleNames && (
                  <div className="flex items-center gap-2 text-red-500 ml-1">
                    <AlertCircle className="w-3 h-3" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">{userForm.formState.errors.roleNames.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-8 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-2xl px-8 h-12 font-bold text-gray-500 hover:bg-gray-50 border-gray-200 transition-all uppercase tracking-widest text-[11px]">Batalkan</Button>
            <Button type="submit" isLoading={activeType === 'foundation' ? adminForm.formState.isSubmitting : (activeType === 'lecturer' ? lecturerForm.formState.isSubmitting : userForm.formState.isSubmitting)} className="rounded-2xl px-12 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-[11px]">
              <Save className="w-5 h-5" />
              Simpan {activeType === 'user' ? 'Akun Pengguna' : 'Profil'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
