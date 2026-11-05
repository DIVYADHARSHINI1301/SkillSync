import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, CheckCircle2, AlertCircle, Database, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/profiles';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { Badge } from '@/components/common/Badge';
import { formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/services/supabase';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const configured = isSupabaseConfigured();

  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage('No authenticated user session found.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be blank.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile(user.id, fullName.trim());
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        await refreshProfile();
        setSuccessMessage('Your profile information was updated successfully in Supabase.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const hasProfileRow = Boolean(profile?.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your personal information associated with your Supabase account
        </p>
      </div>

      {successMessage && (
        <Alert
          type="success"
          title="Profile Saved"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          title="Update Failed"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Profile Form Card */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Personal Details
              </CardTitle>
              <Badge variant={hasProfileRow ? 'teal' : 'amber'} size="sm">
                {hasProfileRow ? 'Database Profile Active' : 'New User (Profile Pending)'}
              </Badge>
            </div>
            <CardDescription>
              Stored in the PostgreSQL <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">profiles</code> table, keyed to your Supabase Auth ID.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Divyadharshini S"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              helperText="Your name will be associated with resume analysis records."
            />

            <Input
              label="Email Address"
              type="email"
              disabled
              value={user?.email || 'N/A'}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Managed through Supabase Auth. Email changes require security verification."
            />

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">
                  Supabase User Identifier (UUID)
                </span>
                <span className="font-mono text-[11px] text-slate-600 break-all">
                  {user?.id || 'Unauthenticated'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">
                  Account Created
                </span>
                <span>
                  {user?.created_at ? formatDate(user.created_at) : 'Current Session'}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-between">
            <span className="text-xs text-slate-500">
              {configured
                ? 'Protected by Supabase Row-Level Security (RLS)'
                : 'Offline demonstration mode'}
            </span>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Profile Row Diagnostics */}
      {!hasProfileRow && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">Safe Profile Initialization</h4>
            <p className="leading-relaxed">
              No matching row currently exists in the <code className="font-mono bg-amber-100 px-1 rounded">profiles</code> table for your user ID. Clicking <strong>Save Profile Changes</strong> above will automatically execute an upsert to create your official database record safely.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
