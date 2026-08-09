'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  IconChartBar,
} from '@tabler/icons-react';

// Types for Admin Platform Modules
export interface Organisation {
  id: string;
  name: string;
  domain: string;
  contactEmail: string;
  token: string;
  googleAdsEnabled: boolean;
  activeStudents: number;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'org_admin';
  organisationId: string;
  organisationName: string;
  groupName: string; // e.g. "Class 5A", "Jungle Explorers Group B"
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

  // Active Module State
  const [activeTab, setActiveTab] = useState<'organisations' | 'users' | 'subscriptions'>('organisations');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Initial Seed Data / LocalStorage State
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [usersList, setUsersList] = useState<PlatformUser[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<Subscription[]>([]);

  // Modals
  const [embedModalOrg, setEmbedModalOrg] = useState<Organisation | null>(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null);
  const [orgForm, setOrgForm] = useState({ name: '', domain: '', contactEmail: '', googleAdsEnabled: true });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'org_admin',
    organisationId: '',
    groupName: '',
    assignedWorldId: 1,
  });

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    organisationName: '',
    userEmail: '',
    planName: 'Pro Explorer' as 'Free Starter' | 'Pro Explorer' | 'School Enterprise',
    seats: 25,
    price: '$99/mo',
    renewalDate: '2026-12-31',
  });

  // Check auth session on load & seed defaults
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('puzzlepro_admin_session');
      if (savedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }

      // Seed Organisations
      const savedOrgs = localStorage.getItem('puzzlepro_admin_orgs');
      if (savedOrgs) {
        setOrganisations(JSON.parse(savedOrgs));
      } else {
        const initialOrgs: Organisation[] = [
          {
            id: 'org_001',
            name: 'STEM Explorers Academy',
            domain: 'stemexplorers.edu',
            contactEmail: 'admin@stemexplorers.edu',
            token: 'TOKEN_STEM_9932A',
            googleAdsEnabled: false,
            activeStudents: 140,
            createdAt: '2026-01-15',
          },
          {
            id: 'org_002',
            name: 'Metro City Unified Schools',
            domain: 'metrocityschools.org',
            contactEmail: 'tech@metrocityschools.org',
            token: 'TOKEN_METRO_8821B',
            googleAdsEnabled: true,
            activeStudents: 480,
            createdAt: '2026-02-01',
          },
          {
            id: 'org_003',
            name: 'Jungle Coders Kids Club',
            domain: 'junglecoders.com',
            contactEmail: 'hello@junglecoders.com',
            token: 'TOKEN_JUNGLE_7714C',
            googleAdsEnabled: true,
            activeStudents: 65,
            createdAt: '2026-03-10',
          },
        ];
        setOrganisations(initialOrgs);
        localStorage.setItem('puzzlepro_admin_orgs', JSON.stringify(initialOrgs));
      }

      // Seed Users
      const savedUsers = localStorage.getItem('puzzlepro_admin_users');
      if (savedUsers) {
        setUsersList(JSON.parse(savedUsers));
      } else {
        const initialUsers: PlatformUser[] = [
          {
            id: 'usr_101',
            name: 'Alex Johnson',
            email: 'alex.j@stemexplorers.edu',
            role: 'student',
            organisationId: 'org_001',
            organisationName: 'STEM Explorers Academy',
            groupName: 'Grade 5 Coding Class',
            assignedWorldId: 1,
            totalXP: 450,
            status: 'active',
          },
          {
            id: 'usr_102',
            name: 'Sarah Williams',
            email: 'sarah.w@metrocityschools.org',
            role: 'student',
            organisationId: 'org_002',
            organisationName: 'Metro City Unified Schools',
            groupName: 'Robotics Group A',
            assignedWorldId: 2,
            totalXP: 820,
            status: 'active',
          },
          {
            id: 'usr_103',
            name: 'David Chen',
            email: 'david.c@junglecoders.com',
            role: 'student',
            organisationId: 'org_003',
            organisationName: 'Jungle Coders Kids Club',
            groupName: 'Junior Explorers',
            assignedWorldId: 3,
            totalXP: 1200,
            status: 'active',
          },
          {
            id: 'usr_104',
            name: 'Emily Davis (Instructor)',
            email: 'emily.teacher@stemexplorers.edu',
            role: 'teacher',
            organisationId: 'org_001',
            organisationName: 'STEM Explorers Academy',
            groupName: 'Grade 5 Coding Class',
            assignedWorldId: 1,
            totalXP: 2500,
            status: 'active',
          },
        ];
        setUsersList(initialUsers);
        localStorage.setItem('puzzlepro_admin_users', JSON.stringify(initialUsers));
      }

      // Seed Subscriptions
      const savedSubs = localStorage.getItem('puzzlepro_admin_subs');
      if (savedSubs) {
        setSubscriptionsList(JSON.parse(savedSubs));
      } else {
        const initialSubs: Subscription[] = [
          {
            id: 'sub_301',
            organisationId: 'org_001',
            organisationName: 'STEM Explorers Academy',
            userEmail: 'admin@stemexplorers.edu',
            planName: 'School Enterprise',
            status: 'active',
            seats: 150,
            price: '$299/mo',
            renewalDate: '2027-01-15',
          },
          {
            id: 'sub_302',
            organisationId: 'org_002',
            organisationName: 'Metro City Unified Schools',
            userEmail: 'tech@metrocityschools.org',
            planName: 'School Enterprise',
            status: 'active',
            seats: 500,
            price: '$799/mo',
            renewalDate: '2027-02-01',
          },
          {
            id: 'sub_303',
            organisationId: 'org_003',
            organisationName: 'Jungle Coders Kids Club',
            userEmail: 'hello@junglecoders.com',
            planName: 'Pro Explorer',
            status: 'active',
            seats: 75,
            price: '$149/mo',
            renewalDate: '2026-09-10',
          },
        ];
        setSubscriptionsList(initialSubs);
        localStorage.setItem('puzzlepro_admin_subs', JSON.stringify(initialSubs));
      }
    } catch (e) {}
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

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both admin email and password.');
      return;
    }
    // Simple admin login credential check
    if (loginEmail === 'admin@puzzlepro.com' || loginEmail === 'admin' || loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('puzzlepro_admin_session', 'authenticated');
    } else {
      setAuthError('Invalid Admin credentials. Try admin@puzzlepro.com / admin123');
    }
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

  // Toggle Google Ads per Org
  const toggleGoogleAds = (orgId: string) => {
    const updated = organisations.map((org) => {
      if (org.id === orgId) {
        return { ...org, googleAdsEnabled: !org.googleAdsEnabled };
      }
      return org;
    });
    saveOrgs(updated);
  };

  // Create/Update Org
  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.name) return;

    if (editingOrg) {
      const updated = organisations.map((org) =>
        org.id === editingOrg.id
          ? {
              ...org,
              name: orgForm.name,
              domain: orgForm.domain,
              contactEmail: orgForm.contactEmail,
              googleAdsEnabled: orgForm.googleAdsEnabled,
            }
          : org
      );
      saveOrgs(updated);
    } else {
      const tokenRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newOrg: Organisation = {
        id: `org_${Date.now().toString().slice(-4)}`,
        name: orgForm.name,
        domain: orgForm.domain || `${orgForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
        contactEmail: orgForm.contactEmail || `admin@${orgForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
        token: `TOKEN_${orgForm.name.substring(0, 4).toUpperCase()}_${tokenRandom}`,
        googleAdsEnabled: orgForm.googleAdsEnabled,
        activeStudents: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveOrgs([...organisations, newOrg]);
    }

    setIsOrgModalOpen(false);
    setEditingOrg(null);
    setOrgForm({ name: '', domain: '', contactEmail: '', googleAdsEnabled: true });
  };

  const handleDeleteOrg = (id: string) => {
    if (confirm('Are you sure you want to delete this organisation?')) {
      saveOrgs(organisations.filter((o) => o.id !== id));
    }
  };

  // Create/Update User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    const orgObj = organisations.find((o) => o.id === userForm.organisationId) || organisations[0];

    if (editingUser) {
      const updated = usersList.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: userForm.name,
              email: userForm.email,
              role: userForm.role,
              organisationId: orgObj.id,
              organisationName: orgObj.name,
              groupName: userForm.groupName,
              assignedWorldId: userForm.assignedWorldId,
            }
          : u
      );
      saveUsers(updated);
    } else {
      const newUser: PlatformUser = {
        id: `usr_${Date.now().toString().slice(-4)}`,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        organisationId: orgObj.id,
        organisationName: orgObj.name,
        groupName: userForm.groupName || 'Default Group A',
        assignedWorldId: userForm.assignedWorldId || 1,
        totalXP: 100,
        status: 'active',
      };
      saveUsers([...usersList, newUser]);
    }

    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'student', organisationId: '', groupName: '', assignedWorldId: 1 });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this user account?')) {
      saveUsers(usersList.filter((u) => u.id !== id));
    }
  };

  // Change Assigned World
  const handleAssignWorld = (userId: string, newWorldId: number) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, assignedWorldId: newWorldId } : u));
    saveUsers(updated);
  };

  // Create Subscription
  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.organisationName || !subForm.userEmail) return;

    const newSub: Subscription = {
      id: `sub_${Date.now().toString().slice(-4)}`,
      organisationName: subForm.organisationName,
      userEmail: subForm.userEmail,
      planName: subForm.planName,
      status: 'active',
      seats: subForm.seats,
      price: subForm.price,
      renewalDate: subForm.renewalDate,
    };
    saveSubs([...subscriptionsList, newSub]);
    setIsSubModalOpen(false);
  };

  // ==========================================
  // UNAUTHENTICATED LOGIN SCREEN (NETS ERP STYLE)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen font-sans flex items-center justify-end p-6 sm:p-12 md:p-20 relative bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: "url('/full_maze.jpeg')" }}
      >
        {/* Rich blue/indigo full-screen gradient overlay matching NETS ERP */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/85 to-slate-950/60 z-0" />

        {/* Floating Hero Info on Left (Medium + Large screens) */}
        <div className="hidden md:flex absolute left-12 lg:left-20 top-1/2 -translate-y-1/2 z-10 max-w-md flex-col gap-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
              <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-extrabold text-xs tracking-widest uppercase text-amber-300">
              PuzzlePro Admin Controls
            </span>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Empowering Talent, <br />
              <span className="text-amber-400">Driving Platform Growth.</span>
            </h1>
            <p className="text-xs text-slate-200/80 mt-4 leading-relaxed font-semibold">
              Welcome to the PuzzlePro Admin Worksuite. Manage organisation iFrame embeds, turn Google Ads monetization on/off, assign STEM learning worlds to students, and manage paid subscriptions in one unified dashboard.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
            © 2026 PuzzlePro Platform Controls. All rights reserved.
          </div>
        </div>

        {/* Floating Login Card on the Right */}
        <div className="relative z-10 w-full max-w-[380px] bg-slate-900/80 md:bg-white/90 p-7 rounded-[28px] border border-white/20 md:border-white/60 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
          <div className="text-center md:text-left">
            <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center border border-amber-600 shadow-md mb-2 mx-auto md:mx-0">
              <IconShieldCheck className="w-7 h-7 text-slate-950" />
            </div>
            <h2 className="text-xl font-black text-white md:text-slate-900 tracking-tight">Admin Controls</h2>
            <p className="text-[10px] text-slate-400 md:text-slate-500 font-bold uppercase tracking-wide mt-0.5">
              Sign in to platform dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {authError && (
              <div className="bg-red-500/10 md:bg-red-50 text-red-400 md:text-red-700 text-[11px] font-bold p-3 rounded-xl border border-red-500/20 md:border-red-200 flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-600 uppercase mb-1 tracking-wider">
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
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm text-xs font-semibold text-white md:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-600 uppercase mb-1 tracking-wider">
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
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm text-xs font-semibold text-white md:text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-98 text-xs cursor-pointer border border-amber-500"
            >
              Sign In to Admin Portal
            </button>
          </form>

          <p className="text-[10px] text-center md:text-left text-slate-400 md:text-slate-500 font-semibold mt-1">
            Default credentials: <span className="font-bold text-amber-500 md:text-slate-900">admin@puzzlepro.com / admin123</span>
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED DASHBOARD (NETS ERP LAYOUT)
  // ==========================================
  const filteredOrgs = organisations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organisationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubs = subscriptionsList.filter(
    (s) =>
      s.organisationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center border border-amber-500 shadow-sm">
            <Image src="/monkey1.svg" alt="PuzzlePro" width={24} height={24} className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>PuzzlePro Admin Controls</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 uppercase font-extrabold tracking-wider">
                v2.1.1 Enterprise
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Platform Administration & Worksuite</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-300 hidden sm:inline">Admin User</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
          >
            <IconLogout className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Organisations</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{organisations.length} Active</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                {organisations.filter((o) => o.googleAdsEnabled).length} Monetized via Ads
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <IconBuildingSkyscraper className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.length} Students</h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">Across 5 Learning Worlds</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IconUsers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Paid Subscriptions</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{subscriptionsList.length} Accounts</h3>
              <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Active Enterprise Plans</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <IconCreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3 Core Modules Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('organisations');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'organisations'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IconBuildingSkyscraper className="w-4 h-4" />
              <span>Organisation Management</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('users');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'users' ? 'bg-slate-900 text-amber-400 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>User & World Assignment</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('subscriptions');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* MODULE 1: ORGANISATION MANAGEMENT */}
        {activeTab === 'organisations' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Organisation Management</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Create organisations, generate unique iFrame embed tokens, and toggle Google Ads monetization.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOrg(null);
                  setOrgForm({ name: '', domain: '', contactEmail: '', googleAdsEnabled: true });
                  setIsOrgModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Organisation</span>
              </button>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="py-3 px-3">Organisation Name</th>
                    <th className="py-3 px-3">Domain</th>
                    <th className="py-3 px-3">Unique Embed Token</th>
                    <th className="py-3 px-3">Google Ads</th>
                    <th className="py-3 px-3">Students</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{org.name}</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{org.domain}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded-lg font-bold">
                            {org.token}
                          </span>
                          <button
                            onClick={() => copyEmbedCode(org)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
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
                        <button
                          onClick={() => toggleGoogleAds(org.id)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer border transition ${
                            org.googleAdsEnabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {org.googleAdsEnabled ? (
                            <>
                              <IconToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>Ads ON</span>
                            </>
                          ) : (
                            <>
                              <IconToggleLeft className="w-4 h-4 text-slate-400" />
                              <span>Ads OFF</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{org.activeStudents}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEmbedModalOrg(org)}
                            className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black flex items-center space-x-1 cursor-pointer"
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
                                googleAdsEnabled: org.googleAdsEnabled,
                              });
                              setIsOrgModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Edit Organisation"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Delete Organisation"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrgs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                        No organisations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 2: USER & WORLD ASSIGNMENT MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">User & World Assignment</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  View student details in assigned groups/classes across organisations and assign Learning Worlds.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({
                    name: '',
                    email: '',
                    role: 'student',
                    organisationId: organisations[0]?.id || '',
                    groupName: '',
                    assignedWorldId: 1,
                  });
                  setIsUserModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Student / User</span>
              </button>
            </div>

            {/* User Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Organisation</th>
                    <th className="py-3 px-3">Group / Class</th>
                    <th className="py-3 px-3">Assigned World</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{usr.name}</td>
                      <td className="py-3.5 px-3 text-slate-500">{usr.email}</td>
                      <td className="py-3.5 px-3 text-slate-700">{usr.organisationName}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          {usr.groupName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {/* Assign World Dropdown */}
                        <select
                          value={usr.assignedWorldId}
                          onChange={(e) => handleAssignWorld(usr.id, parseInt(e.target.value))}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-950 font-black rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                        >
                          <option value={1}>World 1 (Monkey Explorers)</option>
                          <option value={2}>World 2 (HTML Architects)</option>
                          <option value={3}>World 3 (CSS Stylists)</option>
                          <option value={4}>World 4 (JS Logic Wizards)</option>
                          <option value={5}>World 5 (Python Masters)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
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
                                email: usr.email,
                                role: usr.role,
                                organisationId: usr.organisationId,
                                groupName: usr.groupName,
                                assignedWorldId: usr.assignedWorldId,
                              });
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Edit User"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Delete User"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                        No student users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE 3: SUBSCRIPTION MANAGEMENT */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Subscription Management</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
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
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-sm border border-amber-500 transition cursor-pointer self-start sm:self-auto"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Paid Subscription</span>
              </button>
            </div>

            {/* Subscriptions Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="py-3 px-3">Organisation / Account</th>
                    <th className="py-3 px-3">User Email</th>
                    <th className="py-3 px-3">Plan Type</th>
                    <th className="py-3 px-3">Seats</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Renewal Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{sub.organisationName}</td>
                      <td className="py-3.5 px-3 text-slate-500">{sub.userEmail}</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] font-black flex items-center space-x-1 w-fit">
                          <IconCrown className="w-3 h-3 text-amber-600" />
                          <span>{sub.planName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{sub.seats} Seats</td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">{sub.price}</td>
                      <td className="py-3.5 px-3">
                        <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{sub.renewalDate}</td>
                    </tr>
                  ))}
                  {filteredSubs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                        No active subscriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: iFrame Embed Code Viewer Modal */}
      {embedModalOrg && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center space-x-2">
                <IconCode className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">iFrame Embed Code</h3>
              </div>
              <button
                onClick={() => setEmbedModalOrg(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 font-semibold mb-2">
                Embed PuzzlePro into <span className="font-bold text-slate-900">{embedModalOrg.name}</span>'s portal using their unique token:
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto relative border border-slate-800">
                <code>{`<iframe src="https://puzzlepro.ng/embed?org_token=${embedModalOrg.token}" width="100%" height="750px" frameborder="0" allowfullscreen></iframe>`}</code>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => copyEmbedCode(embedModalOrg)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition cursor-pointer"
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

      {/* MODAL 2: Add/Edit Organisation Modal */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-black text-slate-900 text-base">
                {editingOrg ? 'Edit Organisation' : 'Add New Organisation'}
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
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Organisation Name
                </label>
                <input
                  type="text"
                  placeholder="STEM Explorers Academy"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="stemexplorers.edu"
                  value={orgForm.domain}
                  onChange={(e) => setOrgForm({ ...orgForm, domain: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="admin@stemexplorers.edu"
                  value={orgForm.contactEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="googleAdsToggle"
                  checked={orgForm.googleAdsEnabled}
                  onChange={(e) => setOrgForm({ ...orgForm, googleAdsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="googleAdsToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Enable Google Ads Monetization for this Organisation
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer"
                >
                  {editingOrg ? 'Save Changes' : 'Create Organisation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add/Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-black text-slate-900 text-base">
                {editingUser ? 'Edit User & World Assignment' : 'Add New Student / User'}
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
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  placeholder="alex.j@stemexplorers.edu"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Organisation
                  </label>
                  <select
                    value={userForm.organisationId}
                    onChange={(e) => setUserForm({ ...userForm, organisationId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    {organisations.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                    Group / Class
                  </label>
                  <input
                    type="text"
                    placeholder="Grade 5 Coding Class"
                    value={userForm.groupName}
                    onChange={(e) => setUserForm({ ...userForm, groupName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Assigned World
                </label>
                <select
                  value={userForm.assignedWorldId}
                  onChange={(e) => setUserForm({ ...userForm, assignedWorldId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-amber-50 border border-amber-300 font-black text-amber-950 rounded-xl text-xs outline-none"
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
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Subscription Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-black text-slate-900 text-base">Add Paid Subscription</h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  Organisation Name
                </label>
                <input
                  type="text"
                  placeholder="STEM Explorers Academy"
                  value={subForm.organisationName}
                  onChange={(e) => setSubForm({ ...subForm, organisationName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">User Email</label>
                <input
                  type="email"
                  placeholder="admin@stemexplorers.edu"
                  value={subForm.userEmail}
                  onChange={(e) => setSubForm({ ...subForm, userEmail: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Plan</label>
                  <select
                    value={subForm.planName}
                    onChange={(e) => setSubForm({ ...subForm, planName: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="Free Starter">Free Starter</option>
                    <option value="Pro Explorer">Pro Explorer</option>
                    <option value="School Enterprise">School Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Seats</label>
                  <input
                    type="number"
                    value={subForm.seats}
                    onChange={(e) => setSubForm({ ...subForm, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-sm border border-amber-500 cursor-pointer"
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
