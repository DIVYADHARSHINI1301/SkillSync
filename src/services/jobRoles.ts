import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { JobRoleRow } from '@/types/database.types';
import { RoleWithMeta } from '@/types';

// Curated role descriptions for the 6 primary career paths
export const ROLE_DESCRIPTIONS: Record<string, { description: string; category: string }> = {
  'Backend Developer': {
    description: 'Designs, develops, and maintains server-side architecture, RESTful/GraphQL APIs, distributed systems, and database pipelines.',
    category: 'Engineering',
  },
  'Data Analyst': {
    description: 'Translates raw datasets into actionable intelligence through statistical modeling, SQL querying, data cleaning, and executive dashboards.',
    category: 'Analytics',
  },
  'Frontend Developer': {
    description: 'Builds interactive, high-performance web applications using modern component-driven architectures, responsive UX, and accessible styling.',
    category: 'Engineering',
  },
  'Full Stack Developer': {
    description: 'Oversees end-to-end product development across frontend client state, backend microservices, authentication, and database schemas.',
    category: 'Engineering',
  },
  'Java Developer': {
    description: 'Engineers resilient, enterprise-grade backend services, Spring Boot microservices, high-throughput architectures, and cloud deployments.',
    category: 'Enterprise Engineering',
  },
  'Python Developer': {
    description: 'Creates backend APIs, automation workflows, scalable microservices, data processing pipelines, and AI/ML model integrations using Python.',
    category: 'Engineering',
  },
};

/**
 * Helper to fetch roles from backend API if Supabase is unconfigured or offline
 */
async function fetchRolesFromBackend(): Promise<RoleWithMeta[]> {
  try {
    const res = await fetch('/api/job-roles');
    if (res.ok) {
      const data = await res.json();
      return data.map((row: any) => {
        const meta = ROLE_DESCRIPTIONS[row.title] || {
          description: row.description || 'Professional role requiring industry-standard core proficiencies.',
          category: 'Technology',
        };
        const skills = Array.isArray(row.required_skills) ? row.required_skills : [];
        return {
          ...row,
          required_skills: skills,
          description: row.description || meta.description,
          category: meta.category,
          skillCount: skills.length,
        };
      });
    }
  } catch (err) {
    console.warn('Backend job roles fallback failed:', err);
  }
  return [];
}

/**
 * Fetch all job roles from Supabase job_roles table or backend microservice
 */
export async function fetchJobRoles(): Promise<{
  roles: RoleWithMeta[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    const backendRoles = await fetchRolesFromBackend();
    if (backendRoles.length > 0) {
      return { roles: backendRoles, error: null };
    }
    return {
      roles: [],
      error: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    const backendRoles = await fetchRolesFromBackend();
    if (backendRoles.length > 0) {
      return { roles: backendRoles, error: null };
    }
    return {
      roles: [],
      error: 'Supabase client is not available.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('job_roles')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.warn('Supabase query failed, attempting backend fallback:', error);
      const backendRoles = await fetchRolesFromBackend();
      if (backendRoles.length > 0) {
        return { roles: backendRoles, error: null };
      }
      return {
        roles: [],
        error: `Database query failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    if (!data || data.length === 0) {
      return {
        roles: [],
        error: null,
      };
    }

    // Map rows to RoleWithMeta
    const formattedRoles: RoleWithMeta[] = (data as JobRoleRow[]).map((row) => {
      const meta = ROLE_DESCRIPTIONS[row.title] || {
        description: row.description || 'Professional role requiring industry-standard core proficiencies.',
        category: 'Technology',
      };

      // Ensure required_skills is always an array
      let skills: string[] = [];
      if (Array.isArray(row.required_skills)) {
        skills = row.required_skills;
      } else if (typeof row.required_skills === 'string') {
        try {
          skills = JSON.parse(row.required_skills);
        } catch {
          skills = (row.required_skills as string).split(',').map((s) => s.trim());
        }
      }

      return {
        ...row,
        required_skills: skills,
        description: row.description || meta.description,
        category: meta.category,
        skillCount: skills.length,
      };
    });

    return {
      roles: formattedRoles,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      roles: [],
      error: `Unexpected network error while retrieving job roles: ${msg}`,
    };
  }
}

/**
 * Fetch a single job role by ID
 */
export async function fetchJobRoleById(roleId: string): Promise<{
  role: RoleWithMeta | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    const backendRoles = await fetchRolesFromBackend();
    const found = backendRoles.find((r) => r.id === roleId || r.title.toLowerCase() === roleId.toLowerCase());
    return { role: found || null, error: found ? null : 'Role not found' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    const backendRoles = await fetchRolesFromBackend();
    const found = backendRoles.find((r) => r.id === roleId || r.title.toLowerCase() === roleId.toLowerCase());
    return { role: found || null, error: found ? null : 'Role not found' };
  }

  try {
    const { data, error } = await supabase
      .from('job_roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error || !data) {
      const backendRoles = await fetchRolesFromBackend();
      const found = backendRoles.find((r) => r.id === roleId || r.title.toLowerCase() === roleId.toLowerCase());
      if (found) return { role: found, error: null };
      return { role: null, error: error?.message || 'Role not found' };
    }

    const row = data as JobRoleRow;
    const meta = ROLE_DESCRIPTIONS[row.title] || {
      description: row.description || 'Target career profile.',
      category: 'Technology',
    };

    let skills: string[] = [];
    if (Array.isArray(row.required_skills)) {
      skills = row.required_skills;
    } else if (typeof row.required_skills === 'string') {
      try {
        skills = JSON.parse(row.required_skills);
      } catch {
        skills = (row.required_skills as string).split(',').map((s) => s.trim());
      }
    }

    return {
      role: {
        ...row,
        required_skills: skills,
        description: row.description || meta.description,
        category: meta.category,
        skillCount: skills.length,
      },
      error: null,
    };
  } catch (err) {
    return { role: null, error: String(err) };
  }
}
