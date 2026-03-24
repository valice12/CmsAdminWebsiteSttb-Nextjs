"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDashboardData
} from '@/lib/api';
import { 
  Newspaper, 
  Calendar, 
  Users, 
  Shield, 
  GraduationCap, 
  ArrowRight,
  ExternalLink,
  Activity,
  Zap,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  path: string;
  description: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    news: 0,
    events: 0,
    programs: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await getDashboardData();
      setStats({
        news: dashboardData.totalNews || 0,
        events: dashboardData.totalEvent || 0,
        programs: dashboardData.totalAcademicProgram || 0,
        users: (dashboardData.totalAdministrator || 0) + (dashboardData.totalLecturer || 0),
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCardProps[] = [
    {
      label: 'Total Berita',
      value: stats.news,
      icon: Newspaper,
      color: 'bg-blue-600',
      path: '/admin/berita',
      description: 'Artikel berita rilis'
    },
    {
      label: 'Event Aktif',
      value: stats.events,
      icon: Calendar,
      color: 'bg-emerald-600',
      path: '/admin/kegiatan',
      description: 'Kegiatan mendatang'
    },
    {
      label: 'Program Studi',
      value: stats.programs,
      icon: GraduationCap,
      color: 'bg-amber-600',
      path: '/admin/akademik',
      description: 'Pusat data akademik'
    },
    {
      label: 'Pengurus Yayasan',
      value: stats.users,
      icon: Users,
      color: 'bg-indigo-600',
      path: '/admin/pengguna',
      description: 'Struktural Yayasan'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
             <Zap className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37] animate-pulse" />
             Dashboard Utama
          </h1>
          <p className="text-muted-foreground font-medium text-lg ml-1">
            Pantau statistik real-time dan kelola konten <span className="text-primary font-black tracking-tighter uppercase italic">STT Bandung</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100/50 p-2 rounded-2xl">
           <Badge variant="outline" className="bg-white px-4 py-2 font-black text-[10px] uppercase tracking-widest border-gray-100 shadow-sm">
              <Activity className="w-3 h-3 mr-2 text-green-500" /> Server: localhost:5066
           </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => router.push(stat.path)}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-primary/20 transition-all hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
             {/* Decorative Background Icon */}
             <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <div className="scale-[3] text-gray-900">
                   <stat.icon />
                </div>
             </div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={`${stat.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    {isLoading ? (
                       <div className="w-10 h-6 bg-gray-100 animate-pulse rounded-lg" />
                    ) : (
                       <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Live
                       </div>
                    )}
                </div>
                
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-primary transition-colors">
                  {isLoading ? '...' : stat.value}
                </h3>
             </div>

             <div className="mt-8 flex items-center justify-between relative z-10">
                <p className="text-[10px] font-bold text-gray-400 italic">{stat.description}</p>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                   <ArrowRight className="w-4 h-4" />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Aktivitas Terbaru</h2>
              <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">
                Riwayat pembaruan konten real-time
              </p>
            </div>
            <Button 
               variant="outline" 
               onClick={() => router.push('/admin/status')}
               className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-gray-100 hover:bg-gray-50 flex items-center gap-2"
            >
               Status API <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="divide-y divide-gray-50 flex-1">
            {isLoading ? (
               <div className="p-20 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sinkronisasi Data...</p>
               </div>
            ) : (
              <div className="p-20 text-center text-muted-foreground italic font-black uppercase tracking-widest opacity-[0.2]">
                Aktifkan Activity Feed di modul berita &amp; kegiatan.
              </div>
            )}
          </div>
          
          <div className="p-6 bg-gray-50/30 flex justify-center">
             <button onClick={() => router.push('/admin/berita')} className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary transition-colors flex items-center gap-3">
                Browse Full Repository <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-10">
           {/* Detailed Breakdown */}
           <div className="bg-[#0B1B3D] rounded-[3rem] p-10 text-white shadow-2xl shadow-navy/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-10 flex items-center gap-2">
                 <Shield className="w-4 h-4" /> Keamanan Sistem
              </h3>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Published Content</span>
                    <span className="text-xl font-black text-[#D4AF37] tracking-tight">{stats.news + stats.events}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div className="bg-[#D4AF37] h-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Admin Coverage</span>
                    <span className="text-xl font-black text-white tracking-tight">100%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div className="bg-white h-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                 <p className="text-[10px] font-bold text-gray-400 italic leading-relaxed">
                    Semua modul telah dihubungkan ke backend portal <br/> melalui port <span className="text-white font-black">5066</span>.
                 </p>
              </div>
           </div>

           {/* Quick Access Grid */}
           <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em] mb-8">Akses Cepat</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Buat Berita', icon: Newspaper, path: '/admin/berita/create' },
                   { label: 'Add Event', icon: Calendar, path: '/admin/kegiatan/create' },
                   { label: 'Admin Status', icon: Layout, path: '/admin/status' },
                   { label: 'Database', icon: Activity, path: '/admin/status' },
                 ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => router.push(action.path)}
                      className="flex flex-col items-center justify-center gap-3 h-28 rounded-3xl bg-gray-50 hover:bg-primary/10 hover:text-primary transition-all group"
                    >
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-primary/10 transition-all">
                          <action.icon className="w-5 h-5" />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
