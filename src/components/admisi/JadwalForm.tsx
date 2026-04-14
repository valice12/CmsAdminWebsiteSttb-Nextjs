"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Calendar, Save, ArrowLeft, Clock, 
    CheckCircle2, AlertCircle, Info, Hash 
} from "lucide-react";
import { toast } from "sonner";
import { editAdmissionDeadline, getAdmissionDeadlineById } from "@/lib/api";

const admissionSchema = z.object({
    academicYear: z.string().min(4, "Tahun akademik wajib diisi"),
    batchOrder: z.coerce.number().min(1, "Nomor gelombang minimal 1"),
    batchDeadlineAt: z.string().min(1, "Batas pendaftaran wajib diisi"),
    formReturnDeadlineAt: z.string().min(1, "Batas pengembalian formulir wajib diisi"),
    documentSelectionDeadlineAt: z.string().min(1, "Batas seleksi dokumen wajib diisi"),
    resultBroadcastAt: z.string().min(1, "Tanggal pengumuman wajib diisi"),
    participantCallAt: z.string().min(1, "Tanggal panggilan peserta wajib diisi"),
    isActive: z.boolean(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface JadwalFormProps {
    id?: string;
}

export default function JadwalForm({ id }: JadwalFormProps) {
    const router = useRouter();
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AdmissionFormData>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            academicYear: "",
            batchOrder: 1,
            batchDeadlineAt: "",
            formReturnDeadlineAt: "",
            documentSelectionDeadlineAt: "",
            resultBroadcastAt: "",
            participantCallAt: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (isEdit) {
            loadJadwal();
        }
    }, [id]);

    const loadJadwal = async () => {
        try {
            setIsLoading(true);
            const data = await getAdmissionDeadlineById(Number(id));
            if (data) {
                form.reset({
                    academicYear: data.academicYear || "",
                    batchOrder: data.batchOrder || 1,
                    batchDeadlineAt: data.batchDeadlineAt ? new Date(data.batchDeadlineAt).toISOString().split('T')[0] : "",
                    formReturnDeadlineAt: data.formReturnDeadlineAt ? new Date(data.formReturnDeadlineAt).toISOString().split('T')[0] : "",
                    documentSelectionDeadlineAt: data.documentSelectionDeadlineAt ? new Date(data.documentSelectionDeadlineAt).toISOString().split('T')[0] : "",
                    resultBroadcastAt: data.resultBroadcastAt ? new Date(data.resultBroadcastAt).toISOString().split('T')[0] : "",
                    participantCallAt: data.participantCallAt ? new Date(data.participantCallAt).toISOString().split('T')[0] : "",
                    isActive: data.isActive ?? true,
                });
            }
        } catch (error) {
            toast.error("Gagal memuat data jadwal");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: AdmissionFormData) => {
        try {
            const payload = {
                id: Number(id),
                ...data,
                // Backend expects DateTime, ISO string is fine
                batchDeadlineAt: new Date(data.batchDeadlineAt).toISOString(),
                formReturnDeadlineAt: new Date(data.formReturnDeadlineAt).toISOString(),
                documentSelectionDeadlineAt: new Date(data.documentSelectionDeadlineAt).toISOString(),
                resultBroadcastAt: new Date(data.resultBroadcastAt).toISOString(),
                participantCallAt: new Date(data.participantCallAt).toISOString(),
            };

            await editAdmissionDeadline(payload);
            toast.success("Jadwal admisi berhasil diperbarui");
            router.push("/admin/admisi/jadwal");
            router.refresh();
        } catch (error) {
            toast.error("Gagal menyimpan perubahan");
            console.error(error);
        }
    };

    const onInvalid = (errors: any) => {
        console.dir(errors);
        toast.error("Penyimpanan gagal. Harap lengkapi semua bidang yang wajib diisi.");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium">Memuat Data Jadwal...</p>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-indigo-200 decoration-4 underline-offset-4">
                            Edit Jadwal Admisi
                        </h1>
                        <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-widest mt-1 flex items-center gap-2">
                             <Hash className="w-3 h-3" /> Gelombang {form.watch('batchOrder')} • {form.watch('academicYear')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="rounded-2xl h-12 px-6 font-bold border-gray-200 hover:bg-gray-50 uppercase tracking-wider text-xs"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 shadow-xl shadow-indigo-600/20 font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                        {form.formState.isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Simpan Perubahan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Left Column: General Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2rem] border-none shadow-xl shadow-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
                            <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 italic">
                                <Info className="w-4 h-4" /> Informasi Dasar
                            </h3>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Tahun Akademik</Label>
                                <Input
                                    {...form.register('academicYear')}
                                    placeholder="Contoh: 2026-2027"
                                    className="h-12 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                />
                                {form.formState.errors.academicYear && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{form.formState.errors.academicYear.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Nomor Gelombang</Label>
                                <Input
                                    type="number"
                                    {...form.register('batchOrder')}
                                    className="h-12 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                />
                                {form.formState.errors.batchOrder && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{form.formState.errors.batchOrder.message}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 pt-4">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    {...form.register('isActive')}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Jadwal Aktif</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-[#0B1B3D] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                         <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                               <Clock className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-tight italic">Status Publikasi</h3>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                Pastikan tahun akademik sesuai dengan format standar (misal: 2026-2027) agar memudahkan filter bagi calon mahasiswa.
                            </p>
                         </div>
                    </div>
                </div>

                {/* Right Column: Deadlines */}
                <div className="lg:col-span-2">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden h-full">
                        <div className="bg-white border-b border-gray-50 p-8 flex items-center justify-between">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2 italic">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Pengaturan Tanggal & Batas Akhir
                            </h3>
                        </div>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-2 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Batas Akhir Pendaftaran</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            {...form.register('batchDeadlineAt')}
                                            className="h-12 pl-10 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                    {form.formState.errors.batchDeadlineAt && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter mt-1">{form.formState.errors.batchDeadlineAt.message}</p>
                                    )}
                                    <p className="text-[10px] text-gray-400 italic">Tanggal penutupan akses formulir online.</p>
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Batas Pengembalian Formulir</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            {...form.register('formReturnDeadlineAt')}
                                            className="h-12 pl-10 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                    {form.formState.errors.formReturnDeadlineAt && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter mt-1">{form.formState.errors.formReturnDeadlineAt.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Seleksi Dokumen</Label>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            {...form.register('documentSelectionDeadlineAt')}
                                            className="h-12 pl-10 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                    {form.formState.errors.documentSelectionDeadlineAt && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter mt-1">{form.formState.errors.documentSelectionDeadlineAt.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Panggilan Peserta (Batch)</Label>
                                    <div className="relative">
                                        <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            {...form.register('participantCallAt')}
                                            className="h-12 pl-10 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                    {form.formState.errors.participantCallAt && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter mt-1">{form.formState.errors.participantCallAt.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2 pt-4 border-t border-gray-50 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Pengumuman Hasil Seleksi</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                        </div>
                                        <Input
                                            type="date"
                                            {...form.register('resultBroadcastAt')}
                                            className="h-12 pl-10 rounded-xl bg-gray-50/50 border-none shadow-inner font-bold focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                    {form.formState.errors.resultBroadcastAt && (
                                        <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter mt-1">{form.formState.errors.resultBroadcastAt.message}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
