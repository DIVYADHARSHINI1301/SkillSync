import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Cpu, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SkillSync</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              An evidence-based resume analysis and career readiness platform designed to connect resume evidence, job requirements, explainable matching, and personalized career roadmaps.
            </p>
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 leading-relaxed max-w-md">
              <span className="font-semibold text-teal-400 block mb-0.5">Evidence Distinction Principle</span>
              SkillSync evaluates what is explicitly documented in a resume. It distinguishes between evidence found in text passages and claims of unverified competence.
            </div>
          </div>

          {/* Product & Stages */}
          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Development Roadmap
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-teal-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Stage 1: Foundation &amp; DB (Active)
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                Stage 2: Resume Analysis Engine
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                Stage 3: Career Intelligence
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                Stage 4: Hardening &amp; Production
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/job-roles" className="hover:text-white transition-colors">
                  Job Role Catalog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillSync (Synvora). Evidence-based career readiness platform.</p>
          <div className="flex items-center gap-4">
            <span>PostgreSQL &amp; Supabase Integration</span>
            <span>•</span>
            <span>Privacy-First File Handling</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
