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
  
  // Helper to check if a path is considered active given the current pathname
  const isPathActive = (path: string, siblings?: MenuItem[]) => {
    const isExact = pathname === path;
    const isSubPath = pathname.startsWith(path + '/') && !path.includes('?');
    
    if (isExact) return true;
    if (!isSubPath) return false;

    // If it's a sub-path match, it should only be active if no other sibling is a "better" match
    const isBetterMatchExist = siblings?.some(sibling => 
      sibling.path !== path && 
      (pathname === sibling.path || (pathname.startsWith(sibling.path + '/') && sibling.path.length > path.length))
    );

    return !isBetterMatchExist;
  };

  // Detect if any child is active
  const hasActiveChild = item.children?.some(child => isPathActive(child.path, item.children));

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
    isActive = isPathActive(item.path);
  }

  // If item has children, it's a dropdown toggle (unless it's a direct link too)
  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 relative group/btn ${
            hasActiveChild || isActive
              ? 'active-nav-gradient text-[#D4AF37] shadow-lg shadow-black/10 border border-white/5'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          {/* Active Accent Bar */}
          {(hasActiveChild || isActive) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4AF37] rounded-r-full shadow-[2px_0_8px_rgba(212,175,55,0.4)]" />
          )}

          <div className="flex items-center gap-3 min-w-0 relative z-10">
            <div className={`shrink-0 transition-transform duration-300 ${hasActiveChild || isActive ? 'scale-110' : 'group-hover/btn:scale-110'}`}>
              {item.icon}
            </div>
            <span className="truncate">{item.label}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-[#D4AF37]' : 'text-gray-500'}`} />
        </button>
        
        {isExpanded && (
          <div className="pl-6 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-500 relative">
             {/* Sub-menu Connector Thread */}
             <div className="absolute left-3 top-0 bottom-3 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
            {item.children.map((child) => {
              const childActive = isPathActive(child.path, item.children);
              return (
                <Link
                  key={child.path}
                  href={child.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 group/child relative ${
                    childActive
                      ? 'text-[#D4AF37] bg-white/[0.03] shadow-inner shadow-black/20'
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ring-2 transition-all duration-300 ${
                    childActive ? 'bg-[#D4AF37] ring-[#D4AF37]/20 scale-125' : 'bg-gray-600 ring-transparent group-hover/child:bg-gray-400'
                  }`} />
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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 relative group/link ${
        isActive
          ? 'active-nav-gradient text-[#D4AF37] shadow-lg shadow-black/10 border border-white/5'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {/* Active Accent Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D4AF37] rounded-r-full shadow-[2px_0_8px_rgba(212,175,55,0.4)]" />
      )}

      <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/link:scale-110'}`}>
        {item.icon}
      </div>
      <span className="truncate relative z-10">{item.label}</span>
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
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0B1B3D] via-[#0B1B3D] to-[#040D21] text-white flex flex-col transform transition-transform duration-500 ease-in-out z-40 border-r border-white/5 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8962D] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight uppercase leading-none">CMS Portal</h2>
              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">STT Bandung</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-white/5">
          <div className="glass-card p-4 rounded-[1.25rem] flex items-center gap-3 hover:bg-white/[0.05] transition-all duration-500 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] flex items-center justify-center text-white ring-2 ring-[#D4AF37]/10 shadow-xl group-hover:rotate-6 transition-transform shrink-0">
              <span className="font-black text-lg">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] truncate tracking-tight">{user.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate mb-1.5 font-bold">{user.email}</p>
              <div className="inline-flex px-2 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-inner max-w-full truncate">
                <ShieldCheck className="w-3 h-3 mr-1.5 shrink-0" />
                <span className="truncate">{(user.roles?.[0] ?? 'Admin')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto sidebar-scrollbar">
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
        <div className="p-6 border-t border-white/5 bg-black/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 font-black text-[11px] uppercase tracking-widest group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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
              <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-3">
                    {index > 0 && <div className="w-1 h-1 rounded-full bg-gray-300" />}
                    <Link
                      href={crumb.path}
                      className={`transition-all duration-300 hover:text-[#D4AF37] ${
                        index === getBreadcrumbs().length - 1
                          ? 'text-gray-900 border-b-2 border-[#D4AF37]/30 pb-0.5'
                          : 'text-gray-400'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </div>
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
