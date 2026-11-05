import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Briefcase,
  History,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Lightbulb,
  GitCompare,
  Map,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className }) => {
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, end: true, group: 'core' },
    { to: '/dashboard/analyze', label: 'Analyze Resume', icon: <FileSearch className="w-4 h-4" />, badge: 'Stage 2', group: 'core' },
    { to: '/dashboard/job-roles', label: 'Job Roles', icon: <Briefcase className="w-4 h-4" />, group: 'core' },
    { to: '/dashboard/history', label: 'Analysis History', icon: <History className="w-4 h-4" />, group: 'core' },
    { to: '/dashboard/insights', label: 'Skill Insights', icon: <Lightbulb className="w-4 h-4" />, group: 'stage3' },
    { to: '/dashboard/compare', label: 'Compare Roles', icon: <GitCompare className="w-4 h-4" />, group: 'stage3' },
    { to: '/dashboard/roadmap', label: 'My Roadmap', icon: <Map className="w-4 h-4" />, group: 'stage3' },
    { to: '/dashboard/resources', label: 'Learning Resources', icon: <BookOpen className="w-4 h-4" />, group: 'stage3' },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="w-4 h-4" />, group: 'account' },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, group: 'account' },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-full',
        className
      )}
    >
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight">SkillSync</span>
          <span className="block text-[10px] text-teal-400 font-medium tracking-wide">
            Career Readiness
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Core Workflow</div>
          {navItems.filter(i => i.group === 'core').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn('flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/80')
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-400/30">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div>
          <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Career Intelligence
          </div>
          {navItems.filter(i => i.group === 'stage3').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/80')
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div>
          <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Account</div>
          {navItems.filter(i => i.group === 'account').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/80')
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User profile brief & sign out */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-400 shrink-0">
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">
                {profile?.full_name || 'Job Seeker'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
