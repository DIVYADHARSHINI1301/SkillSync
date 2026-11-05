import React, { useState } from 'react';
import { Database, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '@/services/supabase';

export const ConfigBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const configured = isSupabaseConfigured();

  if (configured) {
    return null;
  }

  const envSnippet = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-amber-800">Supabase Connection Notice:</span>
          <span className="text-amber-700">
            Database credentials are not yet set in <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">.env</code>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide configuration instructions' : 'View instructions'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-900 space-y-2">
          <p>
            To connect SkillSync to your existing <strong>Synvora</strong> Supabase project:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open your Supabase Dashboard (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-medium">supabase.com/dashboard</a>).</li>
            <li>Select your <strong>Synvora</strong> project and go to <strong>Project Settings → API</strong>.</li>
            <li>Copy the <strong>Project URL</strong> and <strong>anon / public key</strong>.</li>
            <li>Add them to <code className="font-mono bg-amber-100 px-1 rounded">.env</code> in your project root:</li>
          </ol>
          <div className="relative mt-2 p-2.5 bg-slate-900 text-slate-100 rounded-md font-mono text-xs overflow-x-auto flex items-center justify-between">
            <pre className="text-amber-300">{envSnippet}</pre>
            <button
              onClick={copyToClipboard}
              className="ml-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-amber-700">
            Note: Stage 1 will automatically detect your configured credentials upon saving <code>.env</code> and refreshing the page.
          </p>
        </div>
      )}
    </div>
  );
};
