"use client";

import { Shield, Lock, CheckCircle } from 'lucide-react';

interface RoleStatsProps {
  rolesCount: number;
  permissionsCount: number;
}

export function RoleStats({ rolesCount, permissionsCount, showRoles = true, showPermissions = true }: RoleStatsProps & { showRoles?: boolean, showPermissions?: boolean }) {
  const stats = [];

  if (showRoles) {
    stats.push({ label: 'Registered Roles', value: rolesCount, icon: Shield, color: 'text-indigo-600', bgColor: 'bg-indigo-50' });
  }

  if (showPermissions) {
    stats.push({ label: 'Registered Permissions', value: permissionsCount, icon: Lock, color: 'text-amber-500', bgColor: 'bg-amber-50' });
  }

  return (
    <div className="pt-4 border-t border-gray-100/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner`}>
              <stat.icon className={`w-6 h-6 opacity-60 ${stat.color} shrink-0`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
