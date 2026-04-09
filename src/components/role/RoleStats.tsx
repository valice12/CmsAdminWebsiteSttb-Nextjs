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
    stats.push({ label: 'System Keys', value: permissionsCount, icon: Lock, color: 'text-amber-500', bgColor: 'bg-amber-50' });
  }

  stats.push({ label: 'Policy Coverage', value: '100%', icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all group hover:-translate-y-1">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
          <div className={`w-20 h-20 rounded-[1.5rem] ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
            <stat.icon className={`w-10 h-10 opacity-60 ${stat.color} shrink-0`} />
          </div>
        </div>
      ))}
    </div>
  );
}
