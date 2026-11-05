import React from 'react';
import { Menu, Database, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/services/supabase';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, profile } = useAuth();
  const configured = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger on mobile + page title/context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          type="button"
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Synvora Workspace
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-medium text-slate-700">SkillSync Dashboard</span>
        </div>
      </div>

      {/* Right side: Database status pill + user indicator */}
      <div className="flex items-center gap-3">
        {/* Supabase status indicator */}
        <div
          title={configured ? 'Supabase Database Connected' : 'Supabase Not Configured'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            configured
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              configured ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <Database className="w-3 h-3 opacity-70" />
          <span className="hidden sm:inline">
            {configured ? 'Supabase Connected' : 'DB Offline'}
          </span>
        </div>

        {/* User avatar chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold border border-indigo-200">
            {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[140px] truncate">
            {profile?.full_name || user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};
