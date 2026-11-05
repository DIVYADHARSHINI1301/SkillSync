import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Database,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { getSupabaseConfig, checkSupabaseHealth } from '@/services/supabase';

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const config = getSupabaseConfig();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [healthResult, setHealthResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const result = await checkSupabaseHealth();
    setHealthResult({
      tested: true,
      connected: result.connected,
      message: result.message,
    });
    setIsTestingConnection(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Application Settings &amp; Diagnostics
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review database connectivity, security policies, and account sessions
        </p>
      </div>

      {/* Database Integration Diagnostics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Supabase Project Connection
            </CardTitle>
            <Badge variant={config.isConfigured ? 'teal' : 'amber'} size="sm">
              {config.isConfigured ? 'Configured in .env' : 'Configuration Missing'}
            </Badge>
          </div>
          <CardDescription>
            Validates active frontend connectivity to the PostgreSQL Synvora instance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-medium">Supabase URL</span>
              <span className="font-mono text-slate-800 break-all">
                {config.url || 'Not set in .env (VITE_SUPABASE_URL)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-medium">Publishable / Anon Key</span>
              <span className="font-mono text-slate-800">
                {config.hasKey ? 'Configured (Hidden for security)' : 'Missing from .env'}
              </span>
            </div>
          </div>

          {healthResult && (
            <Alert
              type={healthResult.connected ? 'success' : 'error'}
              title={healthResult.connected ? 'Connection Verified' : 'Connection Failed'}
              message={healthResult.message}
              onClose={() => setHealthResult(null)}
            />
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-xs text-slate-500">
            Tests query against the <code className="font-mono">job_roles</code> table
          </span>
          <Button
            variant="outline"
            size="sm"
            isLoading={isTestingConnection}
            onClick={handleTestConnection}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Run Health Test
          </Button>
        </CardFooter>
      </Card>

      {/* Privacy and Data Handling Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Stage 1 Data Minimization &amp; Privacy Policy
          </CardTitle>
          <CardDescription>
            How SkillSync handles your resume and personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Zero Permanent Storage of Files in Stage 1</span>
            </div>
            <p>
              Uploaded resume PDFs are inspected strictly in-browser for byte integrity and size constraints. No PDF files are uploaded to external cloud storage or persistent drives during Stage 1.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>No 3rd-Party LLM Dispatches</span>
            </div>
            <p>
              Resume documents are never transmitted to third-party commercial AI or LLM APIs without explicit user authorization. Future Stage 2 extraction will utilize localized NLP models (PyMuPDF &amp; spaCy).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Session Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-rose-600">
            <LogOut className="w-4 h-4" />
            Account Session
          </CardTitle>
          <CardDescription>
            Currently signed in as <strong className="text-slate-800">{user?.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-between bg-rose-50/40 border-rose-100">
          <span className="text-xs text-slate-500">
            Terminates active session in Supabase Auth
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out of SkillSync
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
