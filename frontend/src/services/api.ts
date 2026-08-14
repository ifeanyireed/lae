import { Organisation, PlatformUser, Subscription } from '@/app/controls/page';

const PLAYER_SERVICE_URL = (
  process.env.NEXT_PUBLIC_PLAYER_SERVICE_URL || 'https://player-service-y1ur.onrender.com'
).replace(/\/+$/, '');

// ORGANISATIONS / SCHOOLS & FAMILIES
export async function fetchOrganisations(type?: string, id?: string): Promise<Organisation[]> {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (id) params.append('id', id);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${PLAYER_SERVICE_URL}/api/v1/organisations${queryString}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.organisations)) {
      return data.organisations.map((item: any) => ({
        ...item,
        contactEmail: item.contactEmail || item.contact_email || '',
        contactPhone: item.contactPhone || item.contact_phone || '',
        googleAdsEnabled:
          item.googleAdsEnabled !== undefined
            ? item.googleAdsEnabled
            : item.google_ads_enabled !== undefined
            ? item.google_ads_enabled
            : true,
        logoUrl: item.logoUrl || item.logo_url || '/monkey1.svg',
      }));
    }
  } catch (e) {}
  return [];
}

export async function saveOrganisation(org: Partial<Organisation>): Promise<Organisation | null> {
  try {
    const payload = {
      ...org,
      contact_email: org.contactEmail || org.contact_email || '',
      contact_phone: org.contactPhone || org.contact_phone || '',
      google_ads_enabled: org.googleAdsEnabled !== undefined ? org.googleAdsEnabled : true,
    };
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/organisations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data && data.success && data.organisation) {
      const o = data.organisation;
      return {
        ...o,
        contactEmail: o.contactEmail || o.contact_email || '',
        contactPhone: o.contactPhone || o.contact_phone || '',
      };
    }
  } catch (e) {}
  return null;
}

export async function toggleGoogleAds(id: string, googleAdsEnabled: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/organisations/google-ads`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, google_ads_enabled: googleAdsEnabled }),
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

export async function deleteOrganisation(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/organisations?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

// USERS & WORLD ASSIGNMENTS
export async function fetchUsers(organisationId?: string): Promise<PlatformUser[]> {
  try {
    const url = organisationId && organisationId !== 'ALL'
      ? `${PLAYER_SERVICE_URL}/api/v1/users?organisation_id=${organisationId}`
      : `${PLAYER_SERVICE_URL}/api/v1/users`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.users)) {
      return data.users.map((u: any) => ({
        id: u.id ? `usr_${u.id}` : u.id,
        name: u.username,
        avatar: u.avatar || '/images/character1.jpg',
        studentCode: u.access_code || '83920193',
        role: u.role || 'student',
        organisationId: u.organisation_id || '',
        organisationName: u.organisation_name || '',
        groupName: u.group_name || 'Default Group A',
        assignedWorldId: u.assigned_world_id || 1,
        totalXP: u.total_xp || 100,
        status: 'active',
      }));
    }
  } catch (e) {}
  return [];
}

export async function saveUser(user: Partial<PlatformUser>): Promise<PlatformUser | null> {
  try {
    const numericId = user.id ? parseInt(user.id.replace('usr_', '')) : 0;
    const body = {
      id: isNaN(numericId) ? 0 : numericId,
      username: user.name,
      access_code: user.studentCode,
      role: user.role || 'student',
      organisation_id: user.organisationId,
      group_name: user.groupName,
      avatar: user.avatar,
      assigned_world_id: user.assignedWorldId || 1,
    };
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data && data.success && data.user) {
      return {
        id: `usr_${data.user.id}`,
        name: data.user.username,
        avatar: data.user.avatar || '/images/character1.jpg',
        studentCode: data.user.access_code,
        role: data.user.role || 'student',
        organisationId: data.user.organisation_id,
        organisationName: user.organisationName || '',
        groupName: user.groupName || 'Default Group A',
        assignedWorldId: data.user.assigned_world_id || 1,
        totalXP: data.user.total_xp || 100,
        status: 'active',
      };
    }
  } catch (e) {}
  return null;
}

export async function saveBatchUsers(organisationId: string, users: Partial<PlatformUser>[]): Promise<boolean> {
  try {
    const formattedUsers = users.map((u) => ({
      username: u.name,
      access_code: u.studentCode,
      role: 'student',
      organisation_id: organisationId,
      group_name: u.groupName || 'Default Group A',
      avatar: u.avatar || '/images/character1.jpg',
      assigned_world_id: u.assignedWorldId || 1,
    }));
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/users/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organisation_id: organisationId, users: formattedUsers }),
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

export async function assignWorld(userId: string, assignedWorldId: number): Promise<boolean> {
  try {
    const numericId = parseInt(userId.replace('usr_', ''));
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/users/world`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: numericId, assigned_world_id: assignedWorldId }),
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const numericId = parseInt(userId.replace('usr_', ''));
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/users?id=${numericId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

// SUBSCRIPTIONS
export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/subscriptions`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.subscriptions)) {
      return data.subscriptions.map((s: any) => ({
        id: s.id,
        organisationId: s.organisation_id,
        organisationName: s.organisation_name,
        userEmail: s.user_email,
        planName: s.plan_name,
        status: s.status,
        seats: s.seats,
        price: s.price,
        renewalDate: s.renewal_date,
      }));
    }
  } catch (e) {}
  return [];
}

export async function saveSubscription(sub: Partial<Subscription>): Promise<Subscription | null> {
  try {
    const body = {
      id: sub.id,
      organisation_id: sub.organisationId,
      organisation_name: sub.organisationName,
      user_email: sub.userEmail,
      plan_name: sub.planName,
      status: sub.status || 'active',
      seats: sub.seats,
      price: sub.price,
      renewal_date: sub.renewalDate,
    };
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data && data.success && data.subscription) {
      return {
        id: data.subscription.id,
        organisationId: data.subscription.organisation_id,
        organisationName: data.subscription.organisation_name,
        userEmail: data.subscription.user_email,
        planName: data.subscription.plan_name,
        status: data.subscription.status,
        seats: data.subscription.seats,
        price: data.subscription.price,
        renewalDate: data.subscription.renewal_date,
      };
    }
  } catch (e) {}
  return null;
}

// IFRAME EMBED HANDLER & VERIFICATION
export interface EmbedVerificationResponse {
  valid: boolean;
  error?: string;
  organisation?: {
    id: string;
    name: string;
    domain: string;
    contact_email?: string;
    type?: string;
  };
  entitlements?: {
    google_ads_enabled: boolean;
    plan_name: string;
    status: string;
    seats: number;
    allowed_worlds: number[];
    allowed_domain?: string;
  };
  player_session_token?: string;
  token_info?: {
    is_signed: boolean;
    minimal_payload: {
      org_id: string;
      exp: number;
    };
  };
}

export async function verifyEmbedToken(token: string): Promise<EmbedVerificationResponse> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const res = await fetch(
      `${PLAYER_SERVICE_URL}/api/v1/embed/verify?token=${encodeURIComponent(token)}&origin=${encodeURIComponent(origin)}`
    );
    const data = await res.json();
    return data;
  } catch (e) {
    return {
      valid: false,
      error: 'Network error verifying iFrame embed token',
    };
  }
}

export async function updateOrgProfile(profile: {
  id: string;
  name: string;
  domain?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/organisations/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: profile.id,
        name: profile.name,
        domain: profile.domain || '',
        contact_email: profile.contactEmail || '',
        contact_phone: profile.contactPhone || '',
        logo_url: profile.logoUrl || '/monkey1.svg',
      }),
    });
    const data = await res.json();
    return !!(data && data.success);
  } catch (e) {
    return false;
  }
}

export async function updateOrgPassword(params: {
  id: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/organisations/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: params.id,
        current_password: params.currentPassword || '',
        new_password: params.newPassword || '',
      }),
    });
    const data = await res.json();
    if (data && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Password update failed' };
  } catch (e) {
    return { success: false, error: 'Network error updating password' };
  }
}

// CENTRES & LOCATIONS
export interface CentreApiItem {
  id: number;
  organisationId: string;
  name: string;
  location?: string;
  code?: string;
}

export interface GroupApiItem {
  id: number;
  organisationId: string;
  centreId?: number;
  centreName?: string;
  name: string;
  code?: string;
  assignedWorldId?: number;
}

export async function fetchCentres(organisationId?: string): Promise<CentreApiItem[]> {
  try {
    const url = organisationId && organisationId !== 'ALL'
      ? `${PLAYER_SERVICE_URL}/api/v1/centres?organisation_id=${organisationId}`
      : `${PLAYER_SERVICE_URL}/api/v1/centres`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.centres)) {
      return data.centres.map((c: any) => ({
        id: c.id,
        organisationId: c.organisation_id,
        name: c.name,
        location: c.location || '',
        code: c.code || '',
      }));
    }
  } catch (e) {}
  return [];
}

export async function saveCentre(centre: Partial<CentreApiItem>): Promise<CentreApiItem | null> {
  try {
    const body = {
      id: centre.id || 0,
      organisation_id: centre.organisationId,
      name: centre.name,
      location: centre.location || '',
      code: centre.code || '',
    };
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/centres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data && data.success && data.centre) {
      return {
        id: data.centre.id,
        organisationId: data.centre.organisation_id,
        name: data.centre.name,
        location: data.centre.location || '',
        code: data.centre.code || '',
      };
    }
  } catch (e) {}
  return null;
}

export async function deleteCentre(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/centres?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data && data.success;
  } catch (e) {}
  return false;
}

export async function fetchGroups(organisationId?: string, centreId?: number): Promise<GroupApiItem[]> {
  try {
    const params = new URLSearchParams();
    if (organisationId && organisationId !== 'ALL') params.append('organisation_id', organisationId);
    if (centreId && centreId > 0) params.append('centre_id', centreId.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/groups${queryString}`);
    const data = await res.json();
    if (data && data.success && Array.isArray(data.groups)) {
      return data.groups.map((g: any) => ({
        id: g.id,
        organisationId: g.organisation_id,
        centreId: g.centre_id || 0,
        centreName: g.centre_name || '',
        name: g.name,
        code: g.code || '',
        assignedWorldId: g.assigned_world_id || 1,
      }));
    }
  } catch (e) {}
  return [];
}

export async function saveGroup(group: Partial<GroupApiItem>): Promise<GroupApiItem | null> {
  try {
    const body = {
      id: group.id || 0,
      organisation_id: group.organisationId,
      centre_id: group.centreId || null,
      name: group.name,
      code: group.code || '',
      assigned_world_id: group.assignedWorldId || 1,
    };
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data && data.success && data.group) {
      return {
        id: data.group.id,
        organisationId: data.group.organisation_id,
        centreId: data.group.centre_id || 0,
        centreName: group.centreName || '',
        name: data.group.name,
        code: data.group.code || '',
        assignedWorldId: data.group.assigned_world_id || 1,
      };
    }
  } catch (e) {}
  return null;
}

// EMAIL VERIFICATION & PASSWORD RESET API HELPERS
export async function sendVerificationCode(email: string): Promise<{ success: boolean; message?: string; error?: string; code?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network request failed' };
  }
}

export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network request failed' };
  }
}

export async function sendForgotPasswordCode(email: string): Promise<{ success: boolean; message?: string; error?: string; code?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network request failed' };
  }
}

export async function resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network request failed' };
  }
}

export async function sendContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  message: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${PLAYER_SERVICE_URL}/api/v1/contact/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to dispatch contact message' };
  }
}

export async function fetchGroupStudentsByCode(groupCode: string, search?: string): Promise<{
  success: boolean;
  error?: string;
  group?: {
    id: number;
    name: string;
    code: string;
    centre_name?: string;
    school_name?: string;
  };
  students?: Array<{
    id: string;
    name: string;
    student_code: string;
    avatar: string;
    total_xp: number;
  }>;
}> {
  try {
    let url = `${PLAYER_SERVICE_URL}/api/v1/group/students?code=${encodeURIComponent(groupCode)}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url);
    return await res.json();
  } catch (e: any) {
    return { success: false, error: 'Network request failed connecting to server' };
  }
}


