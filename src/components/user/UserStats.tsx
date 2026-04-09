"use client";

import { Shield, CheckCircle, Activity } from 'lucide-react';

interface CMSUserDTO {
  isActive: boolean;
}

interface UserStatsProps {
  users: CMSUserDTO[];
}

export function UserStats({ users }: UserStatsProps) {
  const stats = [
    { label: 'Total Accounts', value: users.length, icon: Shield, color: 'text-indigo-600' },
    { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Avg Activity', value: 'High', icon: Activity, color: 'text-amber-500' },
    { label: 'System Health', value: '100%', icon: CheckCircle, color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
          <stat.icon className={`w-10 h-10 opacity-10 ${stat.color}`} />
        </div>
      ))}
    </div>
  );
}
