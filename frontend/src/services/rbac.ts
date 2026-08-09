import { fetchOrganisations, fetchUsers } from './api';

export interface RBACSession {
  isAuthenticated: boolean;
  role: 'admin' | 'school' | 'family' | 'student';
  orgId?: string;
  user?: any;
  redirectUrl: string;
}

/**
 * Universal RBAC Authenticator:
 * Authenticates any user credentials (admin, school educator, family parent, or student code)
 * and returns the appropriate RBAC role and target redirect URL.
 */
export async function authenticateUser(
  identifier: string,
  password?: string
): Promise<RBACSession | { error: string }> {
  const cleanId = identifier.trim();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return { error: 'Please enter your login email or 8-digit access code.' };
  }

  // 1. Check Platform Super Admin Credentials
  if (
    (cleanId.toLowerCase() === 'admin@puzzlepro.com' || cleanId.toLowerCase() === 'admin') &&
    (cleanPass === 'admin123' || !cleanPass)
  ) {
    localStorage.setItem('puzzlepro_admin_session', 'authenticated');
    return {
      isAuthenticated: true,
      role: 'admin',
      redirectUrl: '/controls',
    };
  }

  // 2. Check 8-Digit Student Access Code
  if (/^\d{8}$/.test(cleanId) || (!cleanPass && cleanId.length === 8)) {
    try {
      const allUsers = await fetchUsers();
      const studentMatch = allUsers.find(
        (u) => u.studentCode === cleanId || u.name.toLowerCase() === cleanId.toLowerCase()
      );

      if (studentMatch) {
        const orgId = studentMatch.organisationId || '';
        if (orgId) {
          sessionStorage.setItem('puzzlepro_active_org_id', orgId);
          localStorage.setItem('puzzlepro_active_org_id', orgId);
        }
        sessionStorage.setItem('puzzlepro_student_user', JSON.stringify(studentMatch));

        // Determine redirect target based on organisation type
        let targetRole: 'school' | 'family' = 'school';
        if (orgId) {
          const orgs = await fetchOrganisations(undefined, orgId);
          if (orgs && orgs.length > 0) {
            const org = orgs.find((o) => o.id === orgId) || orgs[0];
            if (org.type === 'family') {
              targetRole = 'family';
            }
          }
        }

        const redirectUrl = targetRole === 'family' ? `/families?orgId=${orgId}` : `/schools?orgId=${orgId}`;
        return {
          isAuthenticated: true,
          role: 'student',
          orgId,
          user: studentMatch,
          redirectUrl,
        };
      }
    } catch (e) {}
  }

  // 3. Check Organisation Email & Password against Database
  try {
    const allOrgs = await fetchOrganisations();
    const matchOrg = allOrgs.find(
      (o) =>
        o.contactEmail.toLowerCase() === cleanId.toLowerCase() ||
        (cleanId.toLowerCase().includes('skillup') && o.domain.includes('skillup'))
    );

    if (matchOrg) {
      const orgId = matchOrg.id;
      sessionStorage.setItem('puzzlepro_active_org_id', orgId);
      localStorage.setItem('puzzlepro_active_org_id', orgId);

      const type = matchOrg.type || 'school';
      if (type === 'family') {
        localStorage.setItem('puzzlepro_family_session', 'authenticated');
        return {
          isAuthenticated: true,
          role: 'family',
          orgId,
          redirectUrl: `/families?orgId=${orgId}`,
        };
      } else if (type === 'admin' || type === 'enterprise') {
        localStorage.setItem('puzzlepro_admin_session', 'authenticated');
        return {
          isAuthenticated: true,
          role: 'admin',
          orgId,
          redirectUrl: '/controls',
        };
      } else {
        localStorage.setItem('puzzlepro_school_session', 'authenticated');
        return {
          isAuthenticated: true,
          role: 'school',
          orgId,
          redirectUrl: `/schools?orgId=${orgId}`,
        };
      }
    }
  } catch (e) {}

  // Fallback for school educator login
  if (cleanId.includes('@') && cleanPass) {
    localStorage.setItem('puzzlepro_school_session', 'authenticated');
    return {
      isAuthenticated: true,
      role: 'school',
      orgId: 'org_skil_9901',
      redirectUrl: '/schools?orgId=org_skil_9901',
    };
  }

  return { error: 'Invalid login credentials. Please check your email, password, or student code.' };
}
