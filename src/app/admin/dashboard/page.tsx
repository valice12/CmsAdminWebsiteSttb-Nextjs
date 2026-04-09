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
  Layout,
  Video,
  FileText,
  BookOpen,
  Book,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  path?: string;
  description: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    news: 0,
    events: 0,
    programs: 0,
    foundation: 0,
    lecturers: 0,
    video: 0,
    article: 0,
    journal: 0,
    monograf: 0,
    buletin: 0,
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
        foundation: dashboardData.totalAdministrator || 0,
        lecturers: dashboardData.totalLecturer || 0,
        video: dashboardData.totalVideo || 0,
        article: dashboardData.totalArticle || 0,
        journal: dashboardData.totalJournal || 0,
        monograf: dashboardData.totalMonograf || 0,
        buletin: dashboardData.totalBuletin || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryStats: StatCardProps[] = [
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
      value: stats.foundation,
      icon: Shield,
      color: 'bg-indigo-600',
      path: '/admin/pengurus-yayasan',
      description: 'Struktural Yayasan'
    },
    {
      label: 'Dosen / Pengajar',
      value: stats.lecturers,
      icon: Users,
      color: 'bg-emerald-600',
      path: '/admin/dosen',
      description: 'Tenaga Pendidik'
    },
  ];

  const mediaStats: StatCardProps[] = [
    {
      label: 'Video Lib.',
      value: stats.video,
      icon: Video,
      color: 'bg-slate-900',
      description: 'Koleksi video'
    },
    {
      label: 'Artikel',
      value: stats.article,
      icon: FileText,
      color: 'bg-amber-600',
      description: 'Karya tulis ilmiah'
    },
    {
      label: 'Jurnal',
      value: stats.journal,
      icon: BookOpen,
      color: 'bg-indigo-600',
      description: 'Publikasi riset'
    },
    {
      label: 'Monograf',
      value: stats.monograf,
      icon: Book,
      color: 'bg-emerald-600',
      description: 'Buku teks akademik'
    },
    {
      label: 'Buletin',
      value: stats.buletin,
      icon: Mail,
      color: 'bg-rose-600',
      description: 'Warta mingguan'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-10">
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
              <Activity className="w-3 h-3 mr-2 text-green-500" /> Host: {process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).host : 'localhost:5066'}
           </Badge>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {primaryStats.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => stat.path && router.push(stat.path)}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-primary/20 transition-all hover:-translate-y-2 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left items-stretch">
        {/* Media Repository Overview */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-9 shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Repositori Media</h2>
                <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Digital Asset Breakdown</p>
              </div>
              <Badge variant="outline" className="h-8 rounded-full font-black text-[9px] uppercase tracking-widest bg-gray-50 border-gray-100 px-4">
                {stats.video + stats.article + stats.journal + stats.monograf + stats.buletin} Aset
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
              {mediaStats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all group flex flex-col justify-center items-center text-center shadow-sm min-h-[140px]">
                  <div className={`${stat.color} text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{isLoading ? '...' : stat.value}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 p-7 rounded-2xl bg-gray-50 border border-gray-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                  <Video className="w-5 h-5 text-primary" />
               </div>
               <p className="text-xs font-bold text-gray-500 italic max-w-xs leading-relaxed">
                  Akses dan kelola seluruh library media akademik secara terpusat melalui portal administrator.
               </p>
            </div>
            <Button onClick={() => router.push('/admin/media')} className="h-11 px-8 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all">
               Browse Library <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </div>
        </div>
 
        {/* System Sidebar */}
        <div className="flex flex-col">
           {/* Detailed Breakdown */}
           <div className="bg-[#0B1B3D] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-navy/20 relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-12 flex items-center gap-2">
                   <Shield className="w-4 h-4" /> Keamanan Sistem
                </h3>
                
                <div className="space-y-10 relative z-10 px-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Database Sync</span>
                      <span className="text-xl font-black text-[#D4AF37] tracking-tight">100%</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                       <div className="bg-[#D4AF37] h-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" style={{ width: '100%' }} />
                    </div>
                  </div>
 
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Server Health</span>
                      <span className="text-xl font-black text-white tracking-tight">Optimal</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                       <div className="bg-white h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-14 p-7 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                 <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed">
                    Sistem dalam kondisi optimal. <br/> Terhubung ke backend portal <br/> melalui port <span className="text-white font-black non-italic ml-1">5066</span>.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
