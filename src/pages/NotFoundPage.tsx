import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <nav className="h-16 border-b border-slate-200 bg-white/80 px-6 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">SkillSync</span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="text-7xl sm:text-9xl font-black text-slate-200 font-mono tracking-tighter">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-4">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          The requested path does not exist in SkillSync. Please check the URL or use the navigation links below.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/sign-in">
              <Button variant="primary">
                Sign In to Account
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © {new Date().getFullYear()} SkillSync. Synvora Project.
      </div>
    </div>
  );
};
