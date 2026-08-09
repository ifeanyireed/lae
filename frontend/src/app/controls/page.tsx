'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchOrganisations as apiFetchOrgs,
  saveOrganisation as apiSaveOrg,
  toggleGoogleAds as apiToggleAds,
  deleteOrganisation as apiDeleteOrg,
  fetchUsers as apiFetchUsers,
  saveUser as apiSaveUser,
  assignWorld as apiAssignWorld,
  deleteUser as apiDeleteUser,
  fetchSubscriptions as apiFetchSubs,
  saveSubscription as apiSaveSub,
} from '@/services/api';
import { authenticateUser } from '@/services/rbac';
import {
  IconBuildingSkyscraper,
  IconUsers,
  IconCreditCard,
  IconCode,
  IconCopy,
  IconCheck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconToggleLeft,
  IconToggleRight,
  IconShieldCheck,
  IconLogout,
  IconWorld,
  IconSchool,
  IconKey,
  IconAlertCircle,
  IconX,
  IconCrown,
  IconRefresh,
  IconPhone,
  IconMail,
  IconFilter,
  IconLoader2,
  IconFolderPlus,
  IconRocket,
  IconDeviceLaptop,
} from '@tabler/icons-react';

// Character avatar options from public/images
const AVATAR_OPTIONS = [
  '/images/character1.jpg',
  '/images/character2.jpg',
  '/images/character3.jpg',
  '/images/character4.jpg',
  '/images/character5.jpg',
  '/images/character6.jpg',
  '/images/character7.jpg',
  '/images/character8.jpg',
  '/images/character9.jpg',
  '/images/character10.jpg',
  '/images/character11.jpg',
  '/images/character12.jpg',
  '/images/character13.jpg',
  '/images/character14.jpg',
  '/images/character15.jpg',
  '/images/character16.jpg',
  '/images/character17.jpg',
  '/images/character18.jpg',
  '/images/character19.jpg',
  '/images/character20.jpg',
];

// Types for Admin Platform Modules
export interface Organisation {
  id: string;
  name: string;
  domain: string;
  contactEmail: string;
  contactPhone: string;
  password?: string;
  type?: string;
  token: string;
  googleAdsEnabled: boolean;
  activeStudents: number;
  groups: string[]; // Groups/classes tied specifically to this School or Family
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  avatar?: string;
  studentCode: string; // 8-digit access code (e.g. 84920193)
  role: 'student' | 'teacher' | 'org_admin';
  organisationId: string;
  organisationName: string;
  groupName: string; // Belongs to school/family's groups
  assignedWorldId: number; // 1 to 5
  totalXP: number;
  status: 'active' | 'suspended';
}

export interface Subscription {
  id: string;
  organisationId?: string;
  organisationName: string;
  userEmail: string;
  planName: 'Free Starter' | 'Pro Explorer' | 'School Enterprise';
  status: 'active' | 'expired' | 'canceled';
  seats: number;
  price: string;
  renewalDate: string;
}

export default function AdminControlsPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Module State & Loading Transitions
  const [activeTab, setActiveTab] = useState<'organisations' | 'users' | 'subscriptions'>('organisations');
  const [isLoadingModule, setIsLoadingModule] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userOrgFilter, setUserOrgFilter] = useState<string>('ALL');
  const [userGroupFilter, setUserGroupFilter] = useState<string>('ALL');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [copiedStudentCodeId, setCopiedStudentCodeId] = useState<string | null>(null);

  // Pagination State
  const [orgPage, setOrgPage] = useState<number>(1);
  const [userPage, setUserPage] = useState<number>(1);
  const [subPage, setSubPage] = useState<number>(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setOrgPage(1);
    setUserPage(1);
    setSubPage(1);
  }, [searchQuery, userOrgFilter, userGroupFilter]);

  // Tab switch with animated loading state
  const handleTabChange = (tab: 'organisations' | 'users' | 'subscriptions') => {
    if (tab === activeTab) return;
    setIsLoadingModule(true);
    setActiveTab(tab);
    setSearchQuery('');
    setTimeout(() => {
      setIsLoadingModule(false);
    }, 280);
  };

  // Initial Seed Data / LocalStorage State
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [usersList, setUsersList] = useState<PlatformUser[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<Subscription[]>([]);

  // Modals
  const [embedModalOrg, setEmbedModalOrg] = useState<Organisation | null>(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    domain: '',
    contactEmail: '',
    contactPhone: '',
    googleAdsEnabled: true,
    groupsText: '', // Comma-separated list of groups
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: '',
    role: 'student' as 'student' | 'teacher' | 'org_admin',
    organisationId: '',
    groupName: '',
    customGroupName: '',
    assignedWorldId: 1,
  });

  // Helper to generate a unique 8-digit access code for students
  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  // Check auth session on load & seed defaults
  const loadControlsDBData = async () => {
    try {
      const [apiOrgs, apiUsers, apiSubs] = await Promise.all([
        apiFetchOrgs(),
        apiFetchUsers(),
        apiFetchSubs(),
      ]);

      setOrganisations(apiOrgs || []);
      setUsersList(apiUsers || []);
      setSubscriptionsList(apiSubs || []);
    } catch (e) {}
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('puzzlepro_admin_session');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
    loadControlsDBData();
  }, []);

  const saveOrgs = (newOrgs: Organisation[]) => {
    setOrganisations(newOrgs);
    try {
      localStorage.setItem('puzzlepro_admin_orgs', JSON.stringify(newOrgs));
    } catch (e) {}
  };

  const saveUsers = (newUsers: PlatformUser[]) => {
    setUsersList(newUsers);
    try {
      localStorage.setItem('puzzlepro_admin_users', JSON.stringify(newUsers));
    } catch (e) {}
  };

  const saveSubs = (newSubs: Subscription[]) => {
    setSubscriptionsList(newSubs);
    try {
      localStorage.setItem('puzzlepro_admin_subs', JSON.stringify(newSubs));
    } catch (e) {}
  };

  const router = useRouter();

  // Animated Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    const res = await authenticateUser(loginEmail, loginPassword);
    if ('error' in res) {
      setAuthError(res.error);
      setIsLoggingIn(false);
      return;
    }

    if (res.redirectUrl && res.redirectUrl !== '/controls') {
      router.push(res.redirectUrl);
    } else {
      setIsAuthenticated(true);
      localStorage.setItem('puzzlepro_admin_session', 'authenticated');
      await loadControlsDBData();
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('puzzlepro_admin_session');
  };

  // Copy iFrame Embed Code
  const copyEmbedCode = (org: Organisation) => {
    const embedCode = `<iframe src="https://puzzlepro.ng/embed?org_token=${org.token}" width="100%" height="750px" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedTokenId(org.id);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  // Copy Student 8-Digit Access Code
  const copyStudentCode = (userId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStudentCodeId(userId);
    setTimeout(() => setCopiedStudentCodeId(null), 2000);
  };

  // Toggle Google Ads per Org
  const toggleGoogleAds = async (orgId: string) => {
    const org = organisations.find((o) => o.id === orgId);
    if (org) {
      await apiToggleAds(orgId, !org.googleAdsEnabled);
      await loadControlsDBData();
    }
  };

  // Create/Update Org with Tied Groups
  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.name) return;

    const parsedGroups = orgForm.groupsText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const tokenRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orgId = editingOrg ? editingOrg.id : `org_${Date.now().toString().slice(-4)}`;

    await apiSaveOrg({
      id: orgId,
      name: orgForm.name,
      domain: orgForm.domain || `${orgForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactEmail: orgForm.contactEmail || `admin@${orgForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: orgForm.contactPhone || '+1 (555) 000-0000',
      token: editingOrg ? editingOrg.token : `TOKEN_${orgForm.name.substring(0, 4).toUpperCase()}_${tokenRandom}`,
      googleAdsEnabled: orgForm.googleAdsEnabled,
      groups: parsedGroups,
    });

    setIsOrgModalOpen(false);
    setEditingOrg(null);
    setOrgForm({ name: '', domain: '', contactEmail: '', contactPhone: '', googleAdsEnabled: true, groupsText: '' });
    await loadControlsDBData();
  };

  const handleDeleteOrg = async (id: string) => {
    if (confirm('Are you sure you want to delete this school / family?')) {
      await apiDeleteOrg(id);
      await loadControlsDBData();
    }
  };

  // Create/Update User with School/Family-Tied Group
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name) return;

    const targetOrg = organisations.find((o) => o.id === userForm.organisationId) || organisations[0];
    const finalGroup = userForm.groupName === '__NEW_CUSTOM_GROUP__' ? userForm.customGroupName : userForm.groupName;
    const finalStudentCode = userForm.studentCode || generate8DigitCode();

    await apiSaveUser({
      id: editingUser ? editingUser.id : undefined,
      name: userForm.name,
      avatar: userForm.avatar || AVATAR_OPTIONS[0],
      studentCode: finalStudentCode,
      role: userForm.role,
      organisationId: targetOrg ? targetOrg.id : '',
      organisationName: targetOrg ? targetOrg.name : '',
      groupName: finalGroup || 'Default Group A',
      assignedWorldId: userForm.assignedWorldId || 1,
    });

    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserForm({ name: '', avatar: AVATAR_OPTIONS[0], studentCode: '', role: 'student', organisationId: '', groupName: '', customGroupName: '', assignedWorldId: 1 });
    await loadControlsDBData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Delete this student account?')) {
      await apiDeleteUser(id);
      await loadControlsDBData();
    }
  };

  // Change Assigned World
  const handleAssignWorld = async (userId: string, newWorldId: number) => {
    await apiAssignWorld(userId, newWorldId);
    await loadControlsDBData();
  };

  // Create Subscription
  const [subForm, setSubForm] = useState({
    organisationName: '',
    userEmail: '',
    planName: 'Pro Explorer' as 'Free Starter' | 'Pro Explorer' | 'School Enterprise',
    seats: 25,
    price: '$99/mo',
    renewalDate: '2026-12-31',
  });

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.organisationName || !subForm.userEmail) return;

    await apiSaveSub({
      id: `sub_${Date.now().toString().slice(-4)}`,
      organisationName: subForm.organisationName,
      userEmail: subForm.userEmail,
      planName: subForm.planName,
      status: 'active',
      seats: subForm.seats,
      price: subForm.price,
      renewalDate: subForm.renewalDate,
    });
    setIsSubModalOpen(false);
    await loadControlsDBData();
  };

  // Dynamically calculate groups tied to selected School/Family for filtering
  const selectedOrgObj = organisations.find((o) => o.id === userOrgFilter);
  const availableGroupsForFilter = userOrgFilter === 'ALL'
    ? Array.from(new Set(organisations.flatMap((o) => o.groups || []).concat(usersList.map((u) => u.groupName))))
    : (selectedOrgObj?.groups || Array.from(new Set(usersList.filter((u) => u.organisationId === userOrgFilter).map((u) => u.groupName))));

  // Handle Org Filter Change and reset group if not tied to org
  const handleOrgFilterChange = (orgId: string) => {
    setUserOrgFilter(orgId);
    if (orgId === 'ALL') return;
    const org = organisations.find((o) => o.id === orgId);
    if (org && userGroupFilter !== 'ALL' && !org.groups.includes(userGroupFilter)) {
      setUserGroupFilter('ALL');
    }
  };

  // Dynamically calculate groups tied to selected School/Family for User Modal
  const modalSelectedOrg = organisations.find((o) => o.id === (userForm.organisationId || organisations[0]?.id));
  const modalGroups = modalSelectedOrg?.groups || ['Default Group A'];

  // ==========================================
  // UNAUTHENTICATED LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-end p-6 sm:p-12 md:p-20 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover filter brightness-85 contrast-105 z-0"
        >
          <source src="/login_bg.mov" type="video/quicktime" />
          <source src="/login_bg.mov" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/85 to-slate-950/65 z-0" />

        <div className="hidden md:flex absolute left-12 lg:left-20 top-1/2 -translate-y-1/2 z-10 max-w-lg flex-col gap-6 text-white animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={56} height={56} className="object-contain drop-shadow-md shrink-0 transition-transform hover:scale-105" />
            <span className="font-normal text-xs tracking-widest uppercase text-amber-300">
              PuzzlePro Controls
            </span>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-medium text-white leading-tight tracking-tight">
              Empowering Talent, <br />
              <span className="text-amber-400 font-medium">Driving Platform Growth.</span>
            </h1>
            <p className="text-xs text-slate-200/90 mt-3 leading-relaxed font-normal">
              PuzzlePro is the ultimate gamified coding platform for schools, educators, and families.
            </p>
          </div>

          {/* Key App Features Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">636 Coding Quests</span>
              <span className="text-[11px] text-slate-200/80">Interactive Scratch blocks, HTML, CSS, JS & Python.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">8-Digit Access Codes</span>
              <span className="text-[11px] text-slate-200/80">Instant passwordless student logins & tracking.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">5 Gamified Worlds</span>
              <span className="text-[11px] text-slate-200/80">Custom world assignments per school or child.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Google Ads & Embeds</span>
              <span className="text-[11px] text-slate-200/80">Toggle ad monetization & iFrame LMS embeds.</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-2">
            © 2026 PuzzlePro Controls Dashboard. All rights reserved.
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[380px] bg-slate-900/80 md:bg-white/90 p-7 rounded-[28px] border border-white/20 md:border-white/60 shadow-2xl backdrop-blur-xl flex flex-col gap-4 animate-fade-in-up">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={48} height={48} className="object-contain mb-2 drop-shadow-md shrink-0 transition-transform hover:scale-105" />
            <h2 className="text-xl font-medium text-white md:text-slate-900 tracking-tight">Controls Dashboard</h2>
            <p className="text-[10px] text-slate-400 md:text-slate-500 font-normal uppercase tracking-wide mt-0.5">
              Sign in to platform dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {authError && (
              <div className="bg-red-500/10 md:bg-red-50 text-red-400 md:text-red-700 text-[11px] font-normal p-3 rounded-xl border border-red-500/20 md:border-red-200 flex items-center gap-2 animate-fade-in-up">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-normal text-slate-300 md:text-slate-600 uppercase mb-1 tracking-wider">
                Admin Email / Username
              </label>
              <input
                type="text"
                placeholder="admin@puzzlepro.com"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setAuthError('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm text-xs font-normal text-white md:text-slate-900 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[9px] font-normal text-slate-300 md:text-slate-600 uppercase mb-1 tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setAuthError('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm text-xs font-normal text-white md:text-slate-900 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-98 text-xs cursor-pointer border border-amber-500 flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              {isLoggingIn ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Controls Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED DASHBOARD
  // ==========================================
  const filteredOrgs = organisations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.groups && o.groups.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organisationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrg = userOrgFilter === 'ALL' || u.organisationId === userOrgFilter;
    const matchesGroup = userGroupFilter === 'ALL' || u.groupName === userGroupFilter;

    return matchesSearch && matchesOrg && matchesGroup;
  });

  const filteredSubs = subscriptionsList.filter(
    (s) =>
      s.organisationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOrgPages = Math.ceil(filteredOrgs.length / itemsPerPage) || 1;
  const orgStartIndex = (orgPage - 1) * itemsPerPage;
  const paginatedOrgs = filteredOrgs.slice(orgStartIndex, orgStartIndex + itemsPerPage);

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const userStartIndex = (userPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + itemsPerPage);

  const totalSubPages = Math.ceil(filteredSubs.length / itemsPerPage) || 1;
  const subStartIndex = (subPage - 1) * itemsPerPage;
  const paginatedSubs = filteredSubs.slice(subStartIndex, subStartIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col relative overflow-x-hidden">
      {/* Top Animated Loading Progress Bar */}
      {isLoadingModule && (
        <div className="h-1 bg-amber-200/60 overflow-hidden absolute top-0 left-0 right-0 z-50">
          <div className="h-full bg-amber-500 animate-top-bar" />
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center space-x-3">
          <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={44} height={44} className="object-contain drop-shadow-sm shrink-0 transition-transform hover:scale-105" />
          <div>
            <h1 className="text-base font-medium text-slate-900 tracking-tight">
              PuzzlePro
            </h1>
            <p className="text-[11px] text-slate-500 font-normal">Controls Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-normal text-slate-600 hidden sm:inline">Admin User</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 shadow-xs active:scale-95"
          >
            <IconLogout className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-fade-in-up">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Schools & Families</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{organisations.length} Active</h3>
              <p className="text-[11px] font-normal text-emerald-600 mt-0.5">
                {organisations.filter((o) => o.googleAdsEnabled).length} Monetized via Ads
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 transition-transform duration-200 hover:scale-110">
              <IconBuildingSkyscraper className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{usersList.length} Students</h3>
              <p className="text-[11px] font-normal text-blue-600 mt-0.5">8-Digit Access Codes Active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 transition-transform duration-200 hover:scale-110">
              <IconUsers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Paid Subscriptions</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{subscriptionsList.length} Accounts</h3>
              <p className="text-[11px] font-normal text-amber-600 mt-0.5">Active Enterprise Plans</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 transition-transform duration-200 hover:scale-110">
              <IconCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3 Core Modules Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-6 w-full sm:w-auto px-2">
            <button
              onClick={() => handleTabChange('organisations')}
              className={`py-1.5 text-xs transition-all duration-200 flex items-center space-x-2 cursor-pointer border-b-2 ${
                activeTab === 'organisations'
                  ? 'text-amber-600 border-amber-500 font-medium scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent font-normal'
              }`}
            >
              <IconBuildingSkyscraper className="w-4 h-4" />
              <span>Schools & Families</span>
            </button>

            <button
              onClick={() => handleTabChange('users')}
              className={`py-1.5 text-xs transition-all duration-200 flex items-center space-x-2 cursor-pointer border-b-2 ${
                activeTab === 'users'
                  ? 'text-amber-600 border-amber-500 font-medium scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent font-normal'
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>User & World Assignment</span>
            </button>

            <button
              onClick={() => handleTabChange('subscriptions')}
              className={`py-1.5 text-xs transition-all duration-200 flex items-center space-x-2 cursor-pointer border-b-2 ${
                activeTab === 'subscriptions'
                  ? 'text-amber-600 border-amber-500 font-medium scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 border-transparent font-normal'
              }`}
            >
              <IconCreditCard className="w-4 h-4" />
              <span>Subscription Management</span>
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="relative w-full sm:w-64">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* MODULE 1: SCHOOLS & FAMILIES */}
        {activeTab === 'organisations' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900 tracking-tight">Schools & Families</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Create schools & family accounts, manage contact emails & phone numbers, assign tied groups, generate iFrame embed tokens, and toggle Google Ads.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOrg(null);
                  setOrgForm({ name: '', domain: '', contactEmail: '', contactPhone: '', googleAdsEnabled: true, groupsText: 'Default Group A' });
                  setIsOrgModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add School / Family</span>
              </button>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    <th className="py-3 px-3">School / Family Name</th>
                    <th className="py-3 px-3">Domain</th>
                    <th className="py-3 px-3">Contact Details</th>
                    <th className="py-3 px-3">Tied Groups / Classes</th>
                    <th className="py-3 px-3">Unique Embed Token</th>
                    <th className="py-3 px-3">Google Ads</th>
                    <th className="py-3 px-3">Students</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {paginatedOrgs.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-slate-50/80 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <td className="py-3.5 px-3 font-normal text-slate-900">{org.name}</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{org.domain}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col space-y-0.5 text-[11px]">
                          <span className="flex items-center space-x-1 text-slate-700 font-normal">
                            <IconMail className="w-3 h-3 text-slate-400" />
                            <span>{org.contactEmail}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-slate-500 font-mono">
                            <IconPhone className="w-3 h-3 text-slate-400" />
                            <span>{org.contactPhone}</span>
                          </span>
                        </div>
                      </td>
                      {/* Tied Groups Badges */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {org.groups && org.groups.length > 0 ? (
                            org.groups.map((grp) => (
                              <span
                                key={grp}
                                className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[10px] font-normal"
                              >
                                {grp}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">No groups assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded-lg font-normal">
                            {org.token}
                          </span>
                          <button
                            onClick={() => copyEmbedCode(org)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Copy iFrame Embed Code"
                          >
                            {copiedTokenId === org.id ? (
                              <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <IconCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {/* Animated iOS Style Sliding Toggle */}
                        <div
                          onClick={() => toggleGoogleAds(org.id)}
                          className="flex items-center space-x-2.5 cursor-pointer group select-none"
                          title="Toggle Google Ads Monetization"
                        >
                          <div
                            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                              org.googleAdsEnabled ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                                org.googleAdsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                          <span className={`text-[11px] font-normal transition-colors duration-200 ${org.googleAdsEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {org.googleAdsEnabled ? 'Ads ON' : 'Ads OFF'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-normal text-slate-800">{org.activeStudents}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEmbedModalOrg(org)}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-normal flex items-center space-x-1 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <IconCode className="w-3.5 h-3.5" />
                            <span>iFrame Snippet</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrg(org);
                              setOrgForm({
                                name: org.name,
                                domain: org.domain,
                                contactEmail: org.contactEmail,
                                contactPhone: org.contactPhone,
                                googleAdsEnabled: org.googleAdsEnabled,
                                groupsText: (org.groups || []).join(', '),
                              });
                              setIsOrgModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title="Edit School / Family & Groups"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title="Delete School / Family"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrgs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-normal animate-fade-in-up">
                        No schools or families found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-150 pt-4 mt-1 gap-3">
              <span className="text-[11px] text-slate-500 font-normal">
                Showing {filteredOrgs.length > 0 ? orgStartIndex + 1 : 0} to {Math.min(orgStartIndex + itemsPerPage, filteredOrgs.length)} of {filteredOrgs.length} accounts
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={orgPage === 1}
                  onClick={() => setOrgPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Previous
                </button>
                <span className="text-xs font-normal text-slate-700 px-2">
                  Page {orgPage} of {totalOrgPages}
                </span>
                <button
                  disabled={orgPage >= totalOrgPages}
                  onClick={() => setOrgPage((prev) => Math.min(prev + 1, totalOrgPages))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: USER & WORLD ASSIGNMENT MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900 tracking-tight">User & World Assignment</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Manage student 8-digit access codes, view groups/classes tied specifically to their school or family, and assign Learning Worlds.
                </p>
              </div>

              <button
                onClick={() => {
                  const defaultOrg = organisations[0];
                  setEditingUser(null);
                  setUserForm({
                    name: '',
                    avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
                    studentCode: generate8DigitCode(),
                    role: 'student',
                    organisationId: defaultOrg?.id || '',
                    groupName: defaultOrg?.groups[0] || 'Default Group A',
                    customGroupName: '',
                    assignedWorldId: 1,
                  });
                  setIsUserModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Student / User</span>
              </button>
            </div>

            {/* School/Family & Tied Group Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-xs font-normal text-slate-500 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                <IconFilter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter By:</span>
              </span>

              {/* School / Family Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-normal text-slate-700">School / Family:</label>
                <select
                  value={userOrgFilter}
                  onChange={(e) => handleOrgFilterChange(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs transition-all duration-200"
                >
                  <option value="ALL">All Schools & Families ({organisations.length})</option>
                  {organisations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tied Groups Dropdown (Updates dynamically when School/Family changes) */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-normal text-slate-700">Group / Class:</label>
                <select
                  value={userGroupFilter}
                  onChange={(e) => setUserGroupFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs transition-all duration-200"
                >
                  <option value="ALL">
                    {userOrgFilter === 'ALL'
                      ? `All Groups (${availableGroupsForFilter.length})`
                      : `All Groups in ${selectedOrgObj?.name || 'Account'} (${availableGroupsForFilter.length})`}
                  </option>
                  {availableGroupsForFilter.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              {(userOrgFilter !== 'ALL' || userGroupFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setUserOrgFilter('ALL');
                    setUserGroupFilter('ALL');
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-normal transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* User Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">8-Digit Access Code</th>
                    <th className="py-3 px-3">School / Family</th>
                    <th className="py-3 px-3">Tied Group / Class</th>
                    <th className="py-3 px-3">Assigned World</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {paginatedUsers.map((usr, index) => (
                    <tr
                      key={usr.id}
                      className="hover:bg-slate-50/80 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <td className="py-3.5 px-3 text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          {/* Student Character Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 relative shrink-0 overflow-hidden shadow-xs transition-transform hover:scale-110">
                            <Image
                              src={usr.avatar || '/images/character1.jpg'}
                              alt={usr.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-normal text-slate-900">{usr.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-amber-100/80 border border-amber-300 text-amber-950 font-mono text-xs px-2.5 py-1 rounded-xl font-normal tracking-widest shadow-xs">
                            {usr.studentCode}
                          </span>
                          <button
                            onClick={() => copyStudentCode(usr.id, usr.studentCode)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                            title="Copy 8-Digit Access Code"
                          >
                            {copiedStudentCodeId === usr.id ? (
                              <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <IconCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-normal">{usr.organisationName}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px] font-normal">
                          {usr.groupName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {/* Assign World Dropdown */}
                        <select
                          value={usr.assignedWorldId}
                          onChange={(e) => handleAssignWorld(usr.id, parseInt(e.target.value))}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-950 font-normal rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs transition-all duration-200"
                        >
                          <option value={1}>World 1 (Monkey Explorers)</option>
                          <option value={2}>World 2 (HTML Architects)</option>
                          <option value={3}>World 3 (CSS Stylists)</option>
                          <option value={4}>World 4 (JS Logic Wizards)</option>
                          <option value={5}>World 5 (Python Masters)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="uppercase text-[10px] font-normal px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(usr);
                              setUserForm({
                                name: usr.name,
                                avatar: usr.avatar || AVATAR_OPTIONS[0],
                                studentCode: usr.studentCode,
                                role: usr.role,
                                organisationId: usr.organisationId,
                                groupName: usr.groupName,
                                customGroupName: '',
                                assignedWorldId: usr.assignedWorldId,
                              });
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title="Edit Student"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title="Delete Student"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-normal animate-fade-in-up">
                        No student users found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-150 pt-4 mt-1 gap-3">
              <span className="text-[11px] text-slate-500 font-normal">
                Showing {filteredUsers.length > 0 ? userStartIndex + 1 : 0} to {Math.min(userStartIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} students
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={userPage === 1}
                  onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Previous
                </button>
                <span className="text-xs font-normal text-slate-700 px-2">
                  Page {userPage} of {totalUserPages}
                </span>
                <button
                  disabled={userPage >= totalUserPages}
                  onClick={() => setUserPage((prev) => Math.min(prev + 1, totalUserPages))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: SUBSCRIPTION MANAGEMENT */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900 tracking-tight">Subscription Management</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Manage paid users, seat licenses, renewal cycles, and enterprise accounts.
                </p>
              </div>

              <button
                onClick={() => {
                  setSubForm({
                    organisationName: organisations[0]?.name || 'STEM Explorers Academy',
                    userEmail: 'admin@stemexplorers.edu',
                    planName: 'School Enterprise',
                    seats: 100,
                    price: '$299/mo',
                    renewalDate: '2027-01-01',
                  });
                  setIsSubModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Paid Subscription</span>
              </button>
            </div>

            {/* Subscriptions Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    <th className="py-3 px-3">School / Family / Account</th>
                    <th className="py-3 px-3">User Email</th>
                    <th className="py-3 px-3">Plan Type</th>
                    <th className="py-3 px-3">Seats</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Renewal Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {paginatedSubs.map((sub, index) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <td className="py-3.5 px-3 font-normal text-slate-900">{sub.organisationName}</td>
                      <td className="py-3.5 px-3 text-slate-500">{sub.userEmail}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] font-normal flex items-center space-x-1 w-fit">
                          <IconCrown className="w-3 h-3 text-amber-600" />
                          <span>{sub.planName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-normal text-slate-800">{sub.seats} Seats</td>
                      <td className="py-3.5 px-3 font-normal text-emerald-700">{sub.price}</td>
                      <td className="py-3.5 px-3">
                        <span className="uppercase text-[10px] font-normal px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{sub.renewalDate}</td>
                    </tr>
                  ))}
                  {filteredSubs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-normal animate-fade-in-up">
                        No active subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-150 pt-4 mt-1 gap-3">
              <span className="text-[11px] text-slate-500 font-normal">
                Showing {filteredSubs.length > 0 ? subStartIndex + 1 : 0} to {Math.min(subStartIndex + itemsPerPage, filteredSubs.length)} of {filteredSubs.length} subscriptions
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={subPage === 1}
                  onClick={() => setSubPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Previous
                </button>
                <span className="text-xs font-normal text-slate-700 px-2">
                  Page {subPage} of {totalSubPages}
                </span>
                <button
                  disabled={subPage >= totalSubPages}
                  onClick={() => setSubPage((prev) => Math.min(prev + 1, totalSubPages))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-xs font-normal cursor-pointer transition-all duration-150 active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: iFrame Embed Code Viewer Modal */}
      {embedModalOrg && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center space-x-2">
                <IconCode className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-slate-900 text-base">iFrame Embed Code</h3>
              </div>
              <button
                onClick={() => setEmbedModalOrg(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 font-normal mb-2">
                Embed PuzzlePro into <span className="font-normal text-slate-900">{embedModalOrg.name}</span>'s portal using their unique token:
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto relative border border-slate-800">
                <code>{`<iframe src="https://puzzlepro.ng/embed?org_token=${embedModalOrg.token}" width="100%" height="750px" frameborder="0" allowfullscreen></iframe>`}</code>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => copyEmbedCode(embedModalOrg)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {copiedTokenId === embedModalOrg.id ? (
                  <>
                    <IconCheck className="w-4 h-4 text-slate-950" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" />
                    <span>Copy iFrame Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit School/Family Modal (with Tied Groups Input) */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">
                {editingOrg ? 'Edit School / Family & Tied Groups' : 'Add New School / Family'}
              </h3>
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrg} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                  School / Family Name
                </label>
                <input
                  type="text"
                  placeholder="STEM Explorers Academy"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="stemexplorers.edu"
                  value={orgForm.domain}
                  onChange={(e) => setOrgForm({ ...orgForm, domain: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Tied Groups Input */}
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                  Tied Groups / Classes (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Grade 5 Coding Class, Senior Coders Club, STEM Lab 1"
                  value={orgForm.groupsText}
                  onChange={(e) => setOrgForm({ ...orgForm, groupsText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs font-normal text-purple-950 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate multiple groups with commas. These groups belong exclusively to this School or Family.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@stemexplorers.edu"
                    value={orgForm.contactEmail}
                    onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={orgForm.contactPhone}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="googleAdsToggle"
                  checked={orgForm.googleAdsEnabled}
                  onChange={(e) => setOrgForm({ ...orgForm, googleAdsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="googleAdsToggle" className="text-xs font-normal text-slate-800 cursor-pointer">
                  Enable Google Ads Monetization for this Account
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  {editingOrg ? 'Save Changes' : 'Create School / Family'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add/Edit User Modal (with School/Family-Tied Group Selection) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">
                {editingUser ? 'Edit Student & World Assignment' : 'Add New Student / User'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Character Avatar Picker */}
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1.5">
                  Select Character Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {AVATAR_OPTIONS.map((avatarPath) => (
                    <button
                      key={avatarPath}
                      type="button"
                      onClick={() => setUserForm({ ...userForm, avatar: avatarPath })}
                      className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        userForm.avatar === avatarPath
                          ? 'border-amber-500 scale-110 shadow-sm ring-2 ring-amber-400/30'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <Image src={avatarPath} alt="Character Avatar" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-normal text-slate-500 uppercase">
                    8-Digit Access Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, studentCode: generate8DigitCode() })}
                    className="text-[10px] font-normal text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer transition-transform hover:scale-105"
                  >
                    <IconRefresh className="w-3 h-3" />
                    <span>Auto Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="83920193"
                  value={userForm.studentCode}
                  onChange={(e) => setUserForm({ ...userForm, studentCode: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono font-normal text-amber-950 tracking-widest focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* School/Family and Dynamic Tied Group Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                    School / Family
                  </label>
                  <select
                    value={userForm.organisationId}
                    onChange={(e) => {
                      const newOrgId = e.target.value;
                      const newOrgObj = organisations.find((o) => o.id === newOrgId);
                      setUserForm({
                        ...userForm,
                        organisationId: newOrgId,
                        groupName: newOrgObj?.groups[0] || 'Default Group A',
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 outline-none"
                  >
                    {organisations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                    Group / Class (Tied to Account)
                  </label>
                  <select
                    value={userForm.groupName}
                    onChange={(e) => setUserForm({ ...userForm, groupName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-purple-50/60 border border-purple-200 text-purple-950 font-normal rounded-xl text-xs outline-none"
                  >
                    {modalGroups.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                    <option value="__NEW_CUSTOM_GROUP__">+ Create New Group for Account</option>
                  </select>
                </div>
              </div>

              {/* Custom Group Name Input if selected */}
              {userForm.groupName === '__NEW_CUSTOM_GROUP__' && (
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                    New Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter new group name (e.g. Science Class 6B)"
                    value={userForm.customGroupName}
                    onChange={(e) => setUserForm({ ...userForm, customGroupName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-purple-50 border border-purple-300 rounded-xl text-xs font-normal text-purple-950 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                  Assigned World
                </label>
                <select
                  value={userForm.assignedWorldId}
                  onChange={(e) => setUserForm({ ...userForm, assignedWorldId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-amber-50 border border-amber-300 font-normal text-amber-950 rounded-xl text-xs outline-none"
                >
                  <option value={1}>World 1 (Monkey Explorers)</option>
                  <option value={2}>World 2 (HTML Architects)</option>
                  <option value={3}>World 3 (CSS Stylists)</option>
                  <option value={4}>World 4 (JS Logic Wizards)</option>
                  <option value={5}>World 5 (Python Masters)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  {editingUser ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Subscription Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">Add Paid Subscription</h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                  School / Family Name
                </label>
                <input
                  type="text"
                  placeholder="STEM Explorers Academy"
                  value={subForm.organisationName}
                  onChange={(e) => setSubForm({ ...subForm, organisationName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">User Email</label>
                <input
                  type="email"
                  placeholder="admin@stemexplorers.edu"
                  value={subForm.userEmail}
                  onChange={(e) => setSubForm({ ...subForm, userEmail: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Plan</label>
                  <select
                    value={subForm.planName}
                    onChange={(e) => setSubForm({ ...subForm, planName: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 outline-none"
                  >
                    <option value="Free Starter">Free Starter</option>
                    <option value="Pro Explorer">Pro Explorer</option>
                    <option value="School Enterprise">School Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Seats</label>
                  <input
                    type="number"
                    value={subForm.seats}
                    onChange={(e) => setSubForm({ ...subForm, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
