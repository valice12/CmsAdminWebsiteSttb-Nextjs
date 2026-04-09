"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  GraduationCap,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Bell,
  Search,
  Activity,
  DollarSign,
  Lock,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { hasPermission } from '@/lib/permissions';
import { MENU_STRUCTURE } from '@/lib/navigation';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  requiredRoles?: string[];
  children?: MenuItem[];
}

// Map icons to paths from MENU_STRUCTURE
const iconMap: Record<string, React.ReactNode> = {
  '/admin/dashboard': <LayoutDashboard className="w-5 h-5" />,
  '/admin/berita': <Newspaper className="w-5 h-5" />,
  '/admin/kegiatan': <Calendar className="w-5 h-5" />,
  '/admin/akademik': <GraduationCap className="w-5 h-5" />,
  '/admin/biaya': <DollarSign className="w-5 h-5 text-amber-500" />,
  '/admin/admisi/jadwal': <Clock className="w-5 h-5 text-amber-400" />,
  '/admin/media': <ImageIcon className="w-5 h-5" />,
  '/admin/personalia': <Users className="w-5 h-5 text-emerald-500" />,
  '/admin/keamanan': <ShieldCheck className="w-5 h-5 text-indigo-600" />,
  '/admin/halaman': <FileText className="w-5 h-5" />,
  '/admin/status': <Activity className="w-5 h-5 text-amber-500" />,
};

const mapNavItemToMenuItem = (item: any): MenuItem => ({
  ...item,
  icon: iconMap[item.path] || <FileText className="w-5 h-5" />,
  children: item.children ? item.children.map(mapNavItemToMenuItem) : undefined
});

const menuItems: MenuItem[] = MENU_STRUCTURE.map(mapNavItemToMenuItem);

function SidebarNavItem({ 
  item, 
  pathname, 
  searchParams, 
  setSidebarOpen 
}: { 
  item: MenuItem; 
  pathname: string; 
  searchParams: any; 
  setSidebarOpen: (open: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Detect if any child is active
  const hasActiveChild = item.children?.some(child => {
    return pathname === child.path || (pathname.startsWith(child.path + '/') && !child.path.includes('?'));
  });

  // Effect to auto-expand if child is active
  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [hasActiveChild]);

  const currentTab = searchParams.get('tab');
  const itemUrl = item.path.includes('http') ? new URL(item.path) : new URL(item.path, 'http://localhost');
  const itemTab = itemUrl.searchParams.get('tab');
  
  let isActive = false;
  
  if (itemTab) {
    isActive = pathname === itemUrl.pathname && currentTab === itemTab;
  } else if (!item.children) {
    isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && !item.path.includes('?'));
  }

  // If item has children, it's a dropdown toggle (unless it's a direct link too)
  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            hasActiveChild || isActive
              ? 'bg-[#1E3A5F] text-[#D4AF37] shadow-lg shadow-black/20'
              : 'text-gray-400 hover:bg-[#1E3A5F] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0">{item.icon}</div>
            <span className="truncate">{item.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="pl-4 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
            {item.children.map((child) => {
              const childActive = pathname === child.path || (pathname.startsWith(child.path + '/') && !child.path.includes('?'));
              return (
                <Link
                  key={child.path}
                  href={child.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                    childActive
                      ? 'text-[#D4AF37] bg-white/5'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
        isActive
          ? 'bg-[#1E3A5F] text-[#D4AF37] shadow-lg shadow-black/20'
          : 'text-gray-400 hover:bg-[#1E3A5F] hover:text-white'
      }`}
    >
      <div className="shrink-0">{item.icon}</div>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
    } else {
      setUser(currentUser);
      setIsLoading(false);

      if (pathname !== '/admin/dashboard' && pathname !== '/admin') {
        const matchingItem = menuItems.find(item => 
          pathname === item.path || pathname.startsWith(item.path + '/')
        );
        
        if (matchingItem && !hasPermission(currentUser.roles || [], matchingItem.permission, matchingItem.requiredRoles)) {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { label, path: fullPath };
    });
    return breadcrumbs;
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Memuat Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0B1B3D] text-white transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">CMS Portal</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">STT Bandung</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center text-white ring-2 ring-[#D4AF37]/20 shadow-lg shadow-gold/20">
              <span className="font-bold text-lg">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user.fullName}</p>
              <p className="text-[11px] text-gray-400 truncate mb-1">{user.email}</p>
              <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                {(user.roles?.[0] ?? 'Admin')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {(() => {
            const userRoles = user?.roles || [];
            
            const checkVisibility = (navItem: MenuItem): boolean => {
              const hasBasePermission = hasPermission(userRoles, navItem.permission, navItem.requiredRoles);
              
              if (navItem.children && navItem.children.length > 0) {
                const anyChildVisible = navItem.children.some(child => checkVisibility(child));
                return (navItem.permission || navItem.requiredRoles) ? (hasBasePermission && anyChildVisible) : anyChildVisible;
              }

              return hasBasePermission;
            };

            return menuItems.map((item) => {
              if (!checkVisibility(item)) return null;

              const filteredItem = {
                ...item,
                children: item.children ? item.children.filter(child => checkVisibility(child)) : undefined
              };

              return (
                <SidebarNavItem 
                  key={item.path} 
                  item={filteredItem} 
                  pathname={pathname} 
                  searchParams={searchParams} 
                  setSidebarOpen={setSidebarOpen} 
                />
              );
            });
          })()}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1E3A5F]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all font-bold text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile Menu Button + Breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                    <Link
                      href={crumb.path}
                      className={`hover:text-primary transition-colors ${
                        index === getBreadcrumbs().length - 1
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Cari fitur..."
                  className="pl-10 w-64 h-9 bg-gray-50 border-gray-100 text-sm focus:bg-white transition-all font-medium"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative group">
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Memuat Sesi...</p>
        </div>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
