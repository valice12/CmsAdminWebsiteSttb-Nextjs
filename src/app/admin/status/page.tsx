"use client";

import { CheckCircle2, XCircle, AlertCircle, Info, ArrowRight, Zap, Database, Terminal, ShieldAlert, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function StatusPage() {
  const router = useRouter();

  const endpoints = [
    {
      module: 'News (Berita)',
      actions: [
        { name: 'Get All News (CMS)', status: 'available', endpoint: 'GET /cms/news/get-all-news', note: 'Sudah diimplementasi di listing' },
        { name: 'Get News Detail', status: 'available', endpoint: 'GET /cms/news/get-news/{id}', note: 'Digunakan untuk view' },
        { name: 'Get All Categories', status: 'no-input', endpoint: 'GET /cms/news/get-all-categories', note: 'Request model kosong' },
        { name: 'Create News', status: 'available', endpoint: 'POST /cms/news/add-news', note: 'Berita form upload' },
        { name: 'Update News', status: 'available', endpoint: 'PUT /cms/news/edit-news', note: 'Berita form update' },
        { name: 'Delete News', status: 'available', endpoint: 'DELETE /cms/news/delete-news/{id}', note: 'Tersedia di backend' },
      ]
    },
    {
      module: 'Events (Kegiatan)',
      actions: [
        { name: 'Get All Events (CMS)', status: 'available', endpoint: 'GET /cms/events/get-all-events', note: 'Sudah diimplementasi di listing' },
        { name: 'Get Event Detail', status: 'available', endpoint: 'GET /cms/events/get-event/{id}', note: 'Digunakan untuk view' },
        { name: 'Get All Categories', status: 'no-input', endpoint: 'GET /cms/events/get-all-categories', note: 'Request model kosong' },
        { name: 'Create Event', status: 'available', endpoint: 'POST /cms/events/add-event', note: 'Kegiatan form upload' },
        { name: 'Update Event', status: 'available', endpoint: 'PUT /cms/events/edit-event', note: 'Kegiatan form update' },
        { name: 'Delete Event', status: 'available', endpoint: 'DELETE /cms/events/delete-event/{id}', note: 'Tersedia di backend' },
      ]
    },
    {
      module: 'Media',
      actions: [
        { name: 'Get All Media (CMS)', status: 'available', endpoint: 'GET /cms/media/get-all', note: 'Semua media format' },
        { name: 'Create Media (All Types)', status: 'available', endpoint: 'POST /cms/media/{format}s/add', note: 'Tersedia & Terintegrasi' },
        { name: 'Update Media (All Types)', status: 'available', endpoint: 'PUT /cms/media/{format}s/edit', note: 'Tersedia & Terintegrasi' },
        { name: 'Delete Media (All Types)', status: 'available', endpoint: 'DELETE /cms/media/{format}s/delete', note: 'Tersedia & Terintegrasi' },
      ]
    },
    {
      module: 'Academics',
      actions: [
        { name: 'Get All Programs', status: 'available', endpoint: 'GET /cms/academic-programs/get-all-academic-programs', note: 'Tersedia di tabel' },
        { name: 'Create Program', status: 'available', endpoint: 'POST /cms/academic-programs/add-academic-program', note: 'Tersedia' },
        { name: 'Edit Program', status: 'available', endpoint: 'PUT /cms/academic-programs/edit-academic-program', note: 'Tersedia' },
        { name: 'Delete Program', status: 'available', endpoint: 'DELETE /cms/academic-programs/delete-academic-program/{id}', note: 'Tersedia' },
      ]
    },
    {
      module: 'Profiles',
      actions: [
        { name: 'Administrators CRUD', status: 'available', endpoint: 'ALL /cms/administrators/*', note: 'Full CRUD Tersedia' },
        { name: 'Lecturers CRUD', status: 'available', endpoint: 'ALL /cms/lecturers/*', note: 'Full CRUD Tersedia' },
      ]
    }
  ];


  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col gap-2 text-left">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Implementation Status</h1>
         </div>
         <p className="text-muted-foreground font-medium text-lg ml-1">
            Laporan ketersediaan API Backend STTB untuk integrasi CMS Next.js.
         </p>
      </div>

      {/* Grid Layout for Modules */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {endpoints.map((mod, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                        <Database className="w-5 h-5" />
                     </div>
                     <h2 className="text-xl font-black text-gray-900 tracking-tight">{mod.module}</h2>
                  </div>
                  <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-3 py-1 bg-gray-50 border-gray-100">
                     {mod.actions.length} Endpoints
                  </Badge>
               </div>

               <div className="p-4 space-y-2 flex-1">
                  {mod.actions.map((action, actionIdx) => (
                     <div key={actionIdx} className="group p-4 rounded-3xl hover:bg-gray-50 transition-all flex items-center justify-between border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                              action.status === 'available' ? 'bg-green-50 text-green-600' :
                              action.status === 'no-input' ? 'bg-blue-50 text-blue-600' :
                              'bg-red-50 text-red-400 opacity-60'
                           }`}>
                              {action.status === 'available' ? <CheckCircle2 className="w-5 h-5" /> :
                               action.status === 'no-input' ? <Zap className="w-5 h-5" /> :
                               <XCircle className="w-5 h-5" />}
                           </div>
                           <div className="text-left">
                              <p className={`font-bold ${action.status === 'missing' ? 'text-gray-400' : 'text-gray-900'}`}>{action.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <code className="text-[10px] font-black tracking-wider text-muted-foreground bg-gray-100/50 px-2 py-0.5 rounded-md uppercase">{action.endpoint}</code>
                              </div>
                           </div>
                        </div>

                        <div className="text-right">
                            {action.status === 'no-input' && (
                               <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 shadow-md shadow-blue-100">NO INPUT REQ</Badge>
                            )}
                            {action.status === 'missing' && (
                               <Badge className="bg-gray-100 text-gray-400 font-extrabold text-[9px] px-2 py-0.5 border-none shadow-none uppercase tracking-tighter">Endpoint Missing</Badge>
                            )}
                            <p className="text-[10px] font-medium text-gray-400 mt-1 max-w-[120px] leading-tight italic">{action.note}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}

         {/* Technical Legend Card */}
         <div className="bg-[#0B1B3D] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="space-y-6 text-left relative z-10">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-xl shadow-black/20">
                  <Terminal className="w-7 h-7" />
               </div>
               <h3 className="text-3xl font-black text-white tracking-tighter">Status Legend</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                     <p className="text-sm font-bold text-gray-300">Available: <span className="text-white">Endpoint aktif dan terhubung.</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                     <p className="text-sm font-bold text-gray-300">No Input: <span className="text-white">Request model JSON kosong (tidak butuh payload).</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                     <p className="text-sm font-bold text-gray-300">Missing: <span className="text-white text-opacity-60">Controller belum mengekspos rute ini.</span></p>
                  </div>
               </div>
            </div>

            <Button 
               onClick={() => router.push('/admin/dashboard')}
               className="mt-10 h-14 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-black text-xs uppercase tracking-widest flex items-center gap-3 relative z-10"
            >
               Kembali ke Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
         </div>
      </div>
    </div>
  );
}
