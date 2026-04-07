"use client";

import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  Zap, 
  Database, 
  Terminal, 
  ShieldAlert, 
  Newspaper,
  Shield,
  Users,
  Key,
  Calendar,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function StatusPage() {
  const router = useRouter();

  const endpoints = [
    {
      module: 'Authentication & Security',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      actions: [
        { name: 'User Login', status: 'available', endpoint: 'POST /cms/login', note: 'Token-based JWT auth' },
        { name: 'Session Validate', status: 'available', endpoint: 'GET /cms/users/me', note: 'Verify active token' },
      ]
    },
    {
      module: 'System Users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      actions: [
        { name: 'Get All Users', status: 'available', endpoint: 'GET /cms/users/get-all-users', note: 'Paginated user list' },
        { name: 'Get User Detail', status: 'available', endpoint: 'GET /cms/users/get-user/{id}', note: 'Profile & meta' },
        { name: 'Update User Info', status: 'available', endpoint: 'PUT /cms/users/edit-user', note: 'Update profile data' },
        { name: 'Delete User', status: 'available', endpoint: 'DELETE /cms/users/delete-user/{id}', note: 'Archive or remove' },
      ]
    },
    {
      module: 'Roles & Permissions',
      icon: Key,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      actions: [
        { name: 'Get All Roles', status: 'available', endpoint: 'GET /cms/users/get-all-roles', note: 'System role list' },
        { name: 'Add New Role', status: 'available', endpoint: 'POST /cms/users/add-role', note: 'Role + permissions mapping' },
        { name: 'Delete Role', status: 'available', endpoint: 'DELETE /cms/users/delete-role/{id}', note: 'Remove system role' },
        { name: 'All Permissions', status: 'available', endpoint: 'GET /cms/users/get-all-permissions', note: 'System functional keys' },
        { name: 'Register Access Key', status: 'available', endpoint: 'POST /cms/users/add-permission', note: 'Add new policy key' },
      ]
    },
    {
      module: 'News (Berita Content)',
      icon: Newspaper,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      actions: [
        { name: 'Get All News', status: 'available', endpoint: 'GET /cms/news/get-all-news', note: 'Public + Private' },
        { name: 'Get News Detail', status: 'available', endpoint: 'GET /cms/news/get-news/{id}', note: 'Includes content HTML' },
        { name: 'News Categories', status: 'no-input', endpoint: 'GET /cms/news/get-all-categories', note: 'Metadata categorization' },
        { name: 'Publish News', status: 'available', endpoint: 'POST /cms/news/add-news', note: 'Multipart/form-data support' },
        { name: 'Update News', status: 'available', endpoint: 'PUT /cms/news/edit-news', note: 'Full content edit' },
        { name: 'Delete News', status: 'available', endpoint: 'DELETE /cms/news/delete-news/{id}', note: 'Immediate removal' },
      ]
    },
    {
      module: 'Events & Calendars',
      icon: Calendar,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      actions: [
        { name: 'Get All Events', status: 'available', endpoint: 'GET /cms/events/get-all-events', note: 'Events & Schedules' },
        { name: 'Event Categories', status: 'no-input', endpoint: 'GET /cms/events/get-all-categories', note: 'Category metadata' },
        { name: 'Register Event', status: 'available', endpoint: 'POST /cms/events/add-event', note: 'Rich event fields' },
        { name: 'Update Event', status: 'available', endpoint: 'PUT /cms/events/edit-event', note: 'Schedule & Info' },
        { name: 'Cancel Event', status: 'available', endpoint: 'DELETE /cms/events/delete-event/{id}', note: 'Soft/Hard delete' },
      ]
    },
    {
      module: 'Admission (Admisi)',
      icon: CreditCard,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      actions: [
        { name: 'Admission Costs', status: 'available', endpoint: 'GET /cms/costs/get-all-costs', note: 'Financial fee list' },
        { name: 'Costs Meta', status: 'available', endpoint: 'GET /cms/costs/get-all-categories', note: 'Category fee mapping' },
        { name: 'Admission Batch', status: 'available', endpoint: 'GET /cms/admission-deadlines/get-all-batch-deadlines', note: 'Reg period list' },
        { name: 'Update Batch', status: 'available', endpoint: 'PUT /cms/admission-deadlines/edit-batch-deadline', note: 'Deadline update' },
      ]
    },
    {
      module: 'Media & Digital Assets',
      icon: Globe,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      actions: [
        { name: 'Media Library', status: 'available', endpoint: 'GET /cms/media/get-all', note: 'Cross-format assets' },
        { name: 'Media Categories', status: 'no-input', endpoint: 'GET /cms/media/categories/get-all', note: 'Asset taxonomy' },
        { name: 'Upload (Multipart)', status: 'available', endpoint: 'POST /cms/media/{format}s/add', note: 'Direct file processing' },
        { name: 'Delete Asset', status: 'available', endpoint: 'DELETE /cms/media/{format}s/delete', note: 'Storage cleanup' },
      ]
    },
    {
        module: 'Academic Operations',
        icon: ShieldCheck,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        actions: [
          { name: 'Academic Programs', status: 'available', endpoint: 'GET /cms/academic-programs/get-all-academic-programs', note: 'Faculty & Degree' },
          { name: 'Program Detail', status: 'available', endpoint: 'GET /cms/academic-programs/get-academic-program/{id}', note: 'Curriculum & Info' },
          { name: 'Update Curriculum', status: 'available', endpoint: 'PUT /cms/academic-programs/edit-academic-program', note: 'Structure update' },
        ]
      },
    {
      module: 'Dashboards (Metrics)',
      icon: LayoutDashboard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      actions: [
        { name: 'Module Statistics', status: 'available', endpoint: 'GET /cms/dashboards', note: 'Aggregated CMS data' },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 p-2 md:p-6 lg:p-0">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-[0.03]">
          <Database className="absolute -top-20 -left-20 w-96 h-96 rotate-12" />
          <Activity className="absolute bottom-10 right-10 w-64 h-64 -rotate-12" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-gray-100 relative">
         <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative group overflow-hidden">
                    <ShieldAlert className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                <div>
                   <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">API Ecosystem</h1>
                   <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-500 text-white font-black px-2 py-0.5 text-[9px] uppercase tracking-widest border-none shadow-sm shadow-emerald-200">System Healthy</Badge>
                      <span className="text-xs font-bold text-gray-400">V1.4 Stable</span>
                   </div>
                </div>
            </div>
            <p className="text-muted-foreground font-medium text-xl max-w-2xl leading-snug ml-1">
               Laporan komprehensif ketersediaan API Backend STTB untuk integrasi visual CMS Next.js.
            </p>
         </div>

         <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-10">
            <div className="text-center">
                <p className="text-3xl font-black text-emerald-500">{endpoints.reduce((acc, curr) => acc + curr.actions.length, 0)}</p>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Total Endpoints</p>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="text-center">
                <p className="text-3xl font-black text-indigo-500">{endpoints.length}</p>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Service Modules</p>
            </div>
         </div>
      </div>

      {/* Grid Layout for Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
         {endpoints.map((mod, idx) => (
            <div key={idx} className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col group hover:border-gray-200 transition-all hover:translate-y-[-4px]">
               <div className="p-8 border-b border-gray-50 flex items-start justify-between">
                  <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 ${mod.bgColor} ${mod.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                        <mod.icon className="w-7 h-7" />
                     </div>
                     <div className="text-left">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">{mod.module}</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Connect</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                      <Badge variant="outline" className="font-black text-[10px] uppercase tracking-tighter px-3 py-1 bg-gray-50/50 border-gray-100 text-gray-400">
                         {mod.actions.length} Routes
                      </Badge>
                  </div>
               </div>

               <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200">
                  {mod.actions.map((action, actionIdx) => (
                     <div key={actionIdx} className="group/item p-4 rounded-3xl hover:bg-gray-50 transition-all flex flex-col gap-3 border border-transparent hover:border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                                    action.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                                    action.status === 'no-input' ? 'bg-cyan-50 text-cyan-600' :
                                    'bg-red-50 text-red-400 opacity-60'
                                }`}>
                                    {action.status === 'available' ? <CheckCircle2 className="w-5 h-5 animate-in zoom-in spin-in-90 duration-700" /> :
                                    action.status === 'no-input' ? <Zap className="w-5 h-5" /> :
                                    <XCircle className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <p className={`font-black text-sm uppercase tracking-tight ${action.status === 'missing' ? 'text-gray-300' : 'text-gray-900'}`}>{action.name}</p>
                                    <code className="text-[10px] font-bold tracking-wider text-muted-foreground bg-gray-100/50 px-2 py-0.5 rounded-md uppercase mt-1 inline-block">{action.endpoint}</code>
                                </div>
                            </div>

                            <div className="hidden sm:block">
                                {action.status === 'no-input' && (
                                    <Badge className="bg-cyan-500 text-white font-black text-[8px] px-2 py-0.5 border-none">STATIC_REQ</Badge>
                                )}
                                {action.status === 'missing' && (
                                    <Badge className="bg-gray-100 text-gray-400 font-extrabold text-[8px] px-2 py-0.5 border-none uppercase tracking-tighter">OFFLINE</Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 pl-14 italic tracking-tight">{action.note}</p>
                     </div>
                  ))}
               </div>
            </div>
         ))}

         {/* Technical Legend Card / Admin Quick Links */}
         <div className="bg-[#0B1B3D] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group md:col-span-2 2xl:col-span-1">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="space-y-10 text-left relative z-10">
               <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-2xl">
                        <Terminal className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Infrastructure</h3>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Protocol Legend</p>
                    </div>
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/50 mt-1.5 shrink-0" />
                     <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">API_ACTIVE</p>
                        <p className="text-xs font-medium text-white/50 leading-relaxed mt-1">Endpoint sudah matang (v1) dan siap digunakan di seluruh frontend.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-xl shadow-cyan-500/50 mt-1.5 shrink-0" />
                     <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">INDEPENDENT_REQ</p>
                        <p className="text-xs font-medium text-white/50 leading-relaxed mt-1">Endpoint yang bersifat query-only tanpa membutuhkan payload JSON.</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                     <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xl shadow-rose-500/50 mt-1.5 shrink-0" />
                     <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest">ROUTE_UNAVAILABLE</p>
                        <p className="text-xs font-medium text-white/50 leading-relaxed mt-1 text-opacity-60 italic">Controller belum mengekspos rute ini secara publik.</p>
                     </div>
                  </div>
               </div>
            </div>

            <Button 
               onClick={() => router.push('/admin/dashboard')}
               className="mt-14 h-16 rounded-[1.5rem] bg-white text-gray-900 hover:bg-gray-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 relative z-10 shadow-2xl active:scale-95 transition-all"
            >
               Return to Base Ops <ArrowRight className="w-5 h-5" />
            </Button>
         </div>
      </div>
    </div>
  );
}
