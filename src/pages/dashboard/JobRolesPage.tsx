import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Database,
  Sparkles,
  Layers,
} from 'lucide-react';
import { fetchJobRoles } from '@/services/jobRoles';
import { RoleWithMeta } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { isSupabaseConfigured } from '@/services/supabase';

export const JobRolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const loadRoles = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { roles: data, error } = await fetchJobRoles();
    if (error) {
      setErrorMessage(error);
      setRoles([]);
    } else {
      setRoles(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const filteredRoles = roles.filter((role) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchesTitle = role.title.toLowerCase().includes(query);
    const matchesSkills = role.required_skills?.some((s) => s.toLowerCase().includes(query));
    return matchesTitle || matchesSkills;
  });

  const handleSelectRole = (role: RoleWithMeta) => {
    setSelectedRoleId(role.id);
  };

  const handleProceedToUpload = () => {
    if (selectedRoleId) {
      navigate(`/dashboard/analyze?roleId=${encodeURIComponent(selectedRoleId)}`);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Job Role Catalog
            </h1>
            <Badge variant="teal" size="sm">
              Real DB Data
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Retrieved directly from the Supabase <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">job_roles</code> table. Select a role to evaluate resume alignment.
          </p>
        </div>

        {/* Retry refresh button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRoles}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Catalog
          </Button>
        </div>
      </div>

      {/* Selected Role Sticky Banner if any */}
      {selectedRole && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                  Target Role Selected:
                </span>
                <span className="text-sm font-bold text-indigo-950">{selectedRole.title}</span>
              </div>
              <p className="text-xs text-indigo-700">
                {selectedRole.required_skills?.length || 0} core competencies required. Ready for resume pairing.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleProceedToUpload}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Resume Upload
          </Button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search roles or skills (e.g. Java, Python, SQL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="text-xs text-slate-500 ml-auto hidden sm:block">
          Showing <strong>{filteredRoles.length}</strong> of <strong>{roles.length}</strong> roles from Supabase
        </div>
      </div>

      {/* Database Error Alert with Retry */}
      {errorMessage && (
        <div className="space-y-4">
          <Alert
            type="error"
            title="Database Query Error"
            message={
              <div className="space-y-2">
                <p>{errorMessage}</p>
                {!configured && (
                  <p className="text-xs opacity-90">
                    To load the 6 pre-configured job roles (Backend, Data Analyst, Frontend, Full Stack, Java, Python), configure your <code className="font-mono bg-white/20 px-1 rounded">.env</code> with your Synvora project credentials.
                  </p>
                )}
              </div>
            }
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadRoles}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Database Connection
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-600 font-medium">
            Fetching job roles from Supabase PostgreSQL...
          </p>
        </div>
      )}

      {/* Roles Grid */}
      {!isLoading && !errorMessage && (
        <>
          {filteredRoles.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900">
                {searchQuery ? 'No matching job roles found' : 'No job roles in database'}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No roles or skills matched "${searchQuery}". Try searching for Java, Python, or Developer.`
                  : 'The job_roles table in your Supabase project contains no rows.'}
              </p>
              {searchQuery && (
                <div className="mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                    Clear search filter
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <Card
                    key={role.id}
                    hover
                    onClick={() => handleSelectRole(role)}
                    className={`flex flex-col h-full transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20 shadow-md'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {role.category || 'Engineering'}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Check className="w-3 h-3" />
                            Selected
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {role.required_skills?.length || 0} skills
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {role.title}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed text-slate-600 line-clamp-3 mt-1.5">
                        {role.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Required Competencies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {role.required_skills?.map((skill, idx) => (
                          <Badge key={idx} variant="default" size="sm" className="bg-slate-100/90 text-slate-700 font-medium">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50/80">
                      <Button
                        type="button"
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRole(role);
                        }}
                      >
                        {isSelected ? 'Target Role Selected' : 'Select This Target Role'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
