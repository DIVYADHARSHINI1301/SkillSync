import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SignUpForm } from '@/components/forms/SignUpForm';
import { useAuth } from '@/context/AuthContext';
import { ConfigBanner } from '@/components/common/ConfigBanner';

export const SignUpPage: React.FC = () => {
  const { user } = useAuth();

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <ConfigBanner />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:bg-slate-800 transition-colors shadow-xs">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">SkillSync</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Start your evidence-based career readiness journey with Supabase Auth
            </p>
          </div>

          <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200">
            <SignUpForm />
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SkillSync Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SkillSync. Synvora Project.
      </div>
    </div>
  );
};
