'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCopy,
  IconCheck,
  IconRefresh,
  IconWorld,
  IconLogout,
  IconAlertCircle,
  IconX,
  IconCrown,
  IconHeartHandshake,
  IconLoader2,
  IconSettings,
  IconKey,
  IconCreditCard,
  IconLock,
  IconShieldCheck,
} from '@tabler/icons-react';

import { useRouter } from 'next/navigation';
import {
  fetchOrganisations,
  fetchUsers,
  saveUser,
  deleteUser,
  assignWorld as assignWorldApi,
  updateOrgProfile,
  updateOrgPassword,
  saveSubscription,
} from '@/services/api';
import { authenticateUser } from '@/services/rbac';

const AVATAR_OPTIONS = Array.from(
  { length: 20 },
  (_, i) => `https://cdn.resultspro.ng/assets/character${i + 1}.jpg`
);

export interface ChildAccount {
  id: string;
  name: string;
  avatar: string;
  studentCode: string;
  assignedWorldId: number;
  totalXP: number;
}

export default function FamiliesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('Family Portal');
  const [children, setChildren] = useState<ChildAccount[]>([]);

  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildAccount | null>(null);
  const [childForm, setChildForm] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: '',
    assignedWorldId: 1,
  });

  const [activeTab, setActiveTab] = useState<'children' | 'profile'>('children');

  const [profileForm, setProfileForm] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '/monkey1.svg',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    planName: 'Family Explorer',
    seats: 5,
    price: '$29/mo',
    renewalDate: '2026-12-31',
    status: 'active',
  });

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [subMsg, setSubMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const loadDataFromDB = async (targetOrgId?: string) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlOrgId = searchParams.get('orgId');
      let orgId = targetOrgId || urlOrgId || sessionStorage.getItem('puzzlepro_active_org_id') || localStorage.getItem('puzzlepro_active_org_id') || '';

      // Read Organisation details directly from Database
      let orgs = await fetchOrganisations('family', orgId || undefined);
      if ((!orgs || orgs.length === 0) && !orgId) {
        orgs = await fetchOrganisations('family');
      }
      if (!orgs || orgs.length === 0) {
        orgs = await fetchOrganisations();
      }

      if (orgs && orgs.length > 0) {
        const matching = orgId ? orgs.find((o) => o.id === orgId) || orgs[0] : orgs[0];
        orgId = matching.id;
        setActiveOrgId(orgId);
        sessionStorage.setItem('puzzlepro_active_org_id', orgId);
        localStorage.setItem('puzzlepro_active_org_id', orgId);
        setFamilyName(matching.name);

        setProfileForm({
          name: matching.name || '',
          contactEmail: matching.contactEmail || '',
          contactPhone: matching.contactPhone || '',
          logoUrl: matching.logoUrl || '/monkey1.svg',
        });
      }

      // Read Children / Users directly from Database
      const remoteUsers = await fetchUsers(orgId || undefined);
      const mapped: ChildAccount[] = remoteUsers.map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar || '/images/character1.jpg',
        studentCode: u.studentCode,
        assignedWorldId: u.assignedWorldId || 1,
        totalXP: u.totalXP || 100,
      }));
      setChildren(mapped);
    } catch (e) {}
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('puzzlepro_family_session');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
    loadDataFromDB();
  }, []);

  const router = useRouter();

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

    if (res.redirectUrl && !res.redirectUrl.startsWith('/families')) {
      router.push(res.redirectUrl);
    } else {
      const targetOrgId = res.orgId || activeOrgId;
      setIsAuthenticated(true);
      localStorage.setItem('puzzlepro_family_session', 'authenticated');
      await loadDataFromDB(targetOrgId);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('puzzlepro_family_session');
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.name) return;

    const finalCode = childForm.studentCode || generate8DigitCode();
    await saveUser({
      id: editingChild ? editingChild.id : undefined,
      name: childForm.name,
      avatar: childForm.avatar,
      studentCode: finalCode,
      role: 'student',
      organisationId: activeOrgId,
      groupName: 'Kids Group',
      assignedWorldId: childForm.assignedWorldId,
    });

    setIsChildModalOpen(false);
    setEditingChild(null);
    setChildForm({
      name: '',
      avatar: AVATAR_OPTIONS[0],
      studentCode: '',
      assignedWorldId: 1,
    });

    await loadDataFromDB(activeOrgId);
  };

  const handleDeleteChild = async (id: string) => {
    if (confirm("Delete child's account?")) {
      await deleteUser(id);
      await loadDataFromDB(activeOrgId);
    }
  };

  const handleAssignWorld = async (id: string, worldId: number) => {
    await assignWorldApi(id, worldId);
    await loadDataFromDB(activeOrgId);
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) return;
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    const success = await updateOrgProfile({
      id: activeOrgId,
      name: profileForm.name,
      contactEmail: profileForm.contactEmail,
      contactPhone: profileForm.contactPhone,
      logoUrl: profileForm.logoUrl,
    });

    setIsUpdatingProfile(false);
    if (success) {
      setFamilyName(profileForm.name);
      setProfileMsg({ type: 'success', text: 'Family profile details updated successfully!' });
      await loadDataFromDB(activeOrgId);
    } else {
      setProfileMsg({ type: 'error', text: 'Failed to update family profile details.' });
    }
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!passwordForm.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateOrgPassword({
      id: activeOrgId,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    setIsUpdatingPassword(false);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'Password update failed.' });
    }
  };

  const handleUpgradeSubscriptionPlan = async (planName: string, seats: number, price: string) => {
    setSubMsg(null);
    const res = await saveSubscription({
      organisationId: activeOrgId,
      planName,
      seats,
      price,
      status: 'active',
      renewalDate: '2026-12-31',
    });

    if (res) {
      setSubscriptionDetails({
        planName,
        seats,
        price,
        renewalDate: '2026-12-31',
        status: 'active',
      });
      setSubMsg({ type: 'success', text: `Subscription updated to ${planName}!` });
    } else {
      setSubMsg({ type: 'error', text: 'Failed to update subscription plan.' });
    }
  };

  const filteredChildren = children.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Full-screen glassmorphic video background login screen matching Admin Controls
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-end p-6 sm:p-12 md:p-20 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            ;(e.target as HTMLElement).style.display = 'none'
          }}
          className="absolute inset-0 w-full h-full object-cover filter brightness-85 contrast-105 z-0"
        >
          <source src="/login_bg.mov" type="video/quicktime" />
          <source src="/login_bg.mov" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-purple-950/85 to-slate-950/65 z-0" />

        <div className="hidden md:flex absolute left-12 lg:left-20 top-1/2 -translate-y-1/2 z-10 max-w-lg flex-col gap-6 text-white animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={56} height={56} className="object-contain drop-shadow-md shrink-0 transition-transform hover:scale-105" />
            <span className="font-normal text-xs tracking-widest uppercase text-amber-300">
              PuzzlePro Families
            </span>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-medium text-white leading-tight tracking-tight">
              Family Portal, <br />
              <span className="text-amber-400 font-medium">Nurturing Future Innovators.</span>
            </h1>
            <p className="text-xs text-slate-200/90 mt-3 leading-relaxed font-normal">
              Manage child coding accounts, copy 8-digit access codes, and guide their journey across gamified worlds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Child Account Creation</span>
              <span className="text-[11px] text-slate-200/80">Easily create & customize profile avatars for your children.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">8-Digit Access Codes</span>
              <span className="text-[11px] text-slate-200/80">Safe & simple 8-digit access codes for kids to sign in.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">World Unlock & Selection</span>
              <span className="text-[11px] text-slate-200/80">Assign Monkey Explorers, HTML, CSS, JS, or Python.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">XP & Achievements</span>
              <span className="text-[11px] text-slate-200/80">Track coding progress, total XP earned, and badges.</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-2">
            © 2026 PuzzlePro Families Portal. All rights reserved.
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[380px] bg-slate-900/80 md:bg-white/90 p-7 rounded-[28px] border border-white/20 md:border-white/60 shadow-2xl backdrop-blur-xl flex flex-col gap-4 animate-fade-in-up">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={48} height={48} className="object-contain mb-2 drop-shadow-md shrink-0 transition-transform hover:scale-105" />
            <h2 className="text-xl font-medium text-white md:text-slate-900 tracking-tight">Family Portal</h2>
            <p className="text-[10px] text-slate-400 md:text-slate-500 font-normal uppercase tracking-wide mt-0.5">
              Sign in to parent portal
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
                Parent Email
              </label>
              <input
                type="email"
                placeholder="parent@family.com"
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
                <span>Sign In to Family Portal</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 md:border-slate-200 text-center text-xs">
            <Link href="/onboarding" className="text-amber-400 md:text-amber-600 font-medium hover:underline">
              New Family? Start Onboarding Setup →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Image src="/monkey1.svg" alt="PuzzlePro" width={44} height={44} className="object-contain" />
          <div>
            <h1 className="text-base font-medium text-slate-900">{familyName}</h1>
            <p className="text-[11px] text-slate-500 font-normal">Parent & Children Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal flex items-center space-x-1.5 border border-slate-200"
          >
            <IconLogout className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-fade-in-up">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Children Accounts</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{children.length} Enrolled</h3>
              <p className="text-[11px] font-normal text-emerald-600 mt-0.5">8-Digit Student Codes Active</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IconHeartHandshake className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Learning Worlds</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">Worlds 1 – 5</h3>
              <p className="text-[11px] font-normal text-amber-600 mt-0.5">Custom World Assignments</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <IconWorld className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Family XP</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">
                {children.reduce((acc, c) => acc + c.totalXP, 0)} XP
              </h3>
              <p className="text-[11px] font-normal text-blue-600 mt-0.5">Combined Coding Progress</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <IconCrown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-6 w-full sm:w-auto px-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('children')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'children' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>Children Accounts & Access Codes</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'profile' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconSettings className="w-4 h-4" />
              <span>Profile & Billing Settings</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search children..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* TAB 1: CHILDREN MANAGEMENT BOX */}
        {activeTab === 'children' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
            <div>
              <h2 className="text-base font-medium text-slate-900">Your Children's Accounts</h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Create accounts for your children, copy their 8-digit access codes, and change their assigned Learning World.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingChild(null);
                setChildForm({
                  name: '',
                  avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
                  studentCode: generate8DigitCode(),
                  assignedWorldId: 1,
                });
                setIsChildModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition"
            >
              <IconPlus className="w-4 h-4" />
              <span>Add Child Account</span>
            </button>
          </div>

          {/* Children Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  <th className="py-3 px-3">Child Name</th>
                  <th className="py-3 px-3">8-Digit Access Code</th>
                  <th className="py-3 px-3">Assigned Learning World</th>
                  <th className="py-3 px-3">Total XP</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                {filteredChildren.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 relative shrink-0 overflow-hidden shadow-xs">
                          <Image src={ch.avatar} alt={ch.name} fill className="object-cover" />
                        </div>
                        <span className="font-normal text-slate-900">{ch.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-100/80 border border-amber-300 text-amber-950 font-mono text-xs px-2.5 py-1 rounded-xl tracking-widest shadow-xs">
                          {ch.studentCode}
                        </span>
                        <button
                          onClick={() => copyCode(ch.id, ch.studentCode)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Copy 8-Digit Access Code"
                        >
                          {copiedCodeId === ch.id ? <IconCheck className="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={ch.assignedWorldId}
                        onChange={(e) => handleAssignWorld(ch.id, parseInt(e.target.value))}
                        className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-950 font-normal rounded-xl text-xs outline-none cursor-pointer"
                      >
                        <option value={1}>World 1 (Monkey Explorers)</option>
                        <option value={2}>World 2 (HTML Architects)</option>
                        <option value={3}>World 3 (CSS Stylists)</option>
                        <option value={4}>World 4 (JS Logic Wizards)</option>
                        <option value={5}>World 5 (Python Masters)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-amber-600">{ch.totalXP} XP</td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingChild(ch);
                            setChildForm({
                              name: ch.name,
                              avatar: ch.avatar,
                              studentCode: ch.studentCode,
                              assignedWorldId: ch.assignedWorldId,
                            });
                            setIsChildModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <IconEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(ch.id)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredChildren.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-normal">
                      No children accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* TAB 2: PROFILE & BILLING SETTINGS */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Header banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 p-2 flex items-center justify-center shadow-xs overflow-hidden">
                  <Image src={profileForm.logoUrl || '/monkey1.svg'} alt="Family Avatar" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{profileForm.name || familyName}</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center space-x-2">
                    <span>{profileForm.contactEmail || 'parent@family.com'}</span>
                    <span>•</span>
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[10px] font-medium">Family Account</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                <IconShieldCheck className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Subscription Status</div>
                  <div className="text-xs font-bold text-slate-800">{subscriptionDetails.planName} ({subscriptionDetails.status})</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Family Profile & Details Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <IconSettings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Family Profile Details</h3>
                    <p className="text-[11px] text-slate-500">Update family name, avatar logo, and parent contact info</p>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {profileMsg.type === 'success' ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconAlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfileSubmit} className="flex flex-col gap-4">
                  {/* Avatar Quick Choice */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">Family Avatar</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['/monkey1.svg', '/lion1.svg', '/penguin1.svg', '/panda1.svg', '/bear1.svg', '/fox1.svg'].map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, logoUrl: img })}
                          className={`w-11 h-11 rounded-full p-1 border transition-all cursor-pointer ${profileForm.logoUrl === img ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <Image src={img} alt="Avatar option" width={36} height={36} className="object-contain w-full h-full" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Family / Household Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Parent Contact Email <span className="text-[10px] font-normal text-slate-400 ml-1">(Read-Only)</span>
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={profileForm.contactEmail}
                        className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed outline-none select-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={profileForm.contactPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-xl text-xs border border-amber-600/30 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {isUpdatingProfile ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <span>Save Family Details</span>}
                  </button>
                </form>
              </div>

              {/* Password & Security Update Form */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <IconKey className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
                      <p className="text-[11px] text-slate-500">Update parent portal login password</p>
                    </div>
                  </div>

                  {passwordMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {passwordMsg.type === 'success' ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconAlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePasswordSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="py-2.5 px-5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs border border-purple-700/30 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-1"
                    >
                      {isUpdatingPassword ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
                    </button>
                  </form>
                </div>

                {/* Subscriptions & Billing Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconCreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Manage Billing & Subscriptions</h3>
                      <p className="text-[11px] text-slate-500">View family plan & active seats</p>
                    </div>
                  </div>

                  {subMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${subMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {subMsg.type === 'success' ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconAlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{subMsg.text}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Plan</span>
                        <h4 className="text-base font-bold text-slate-900">{subscriptionDetails.planName}</h4>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                        {subscriptionDetails.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Children Capacity: <strong>{subscriptionDetails.seats} Kids Included</strong></span>
                      <span>Renewal: <strong>{subscriptionDetails.renewalDate}</strong></span>
                    </div>
                  </div>

                  {/* Upgrade Plans Options */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { name: 'Family Starter', seats: 2, price: '$12/mo' },
                      { name: 'Family Pro', seats: 5, price: '$29/mo' },
                    ].map((plan) => (
                      <button
                        key={plan.name}
                        onClick={() => handleUpgradeSubscriptionPlan(plan.name, plan.seats, plan.price)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${subscriptionDetails.planName === plan.name ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">{plan.name}</div>
                          <div className="text-[10px] text-slate-500">{plan.seats} Children</div>
                        </div>
                        <div className="text-xs font-extrabold text-blue-600 mt-2">{plan.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Child Modal */}
      {isChildModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">{editingChild ? 'Edit Child Account' : 'Add Child Account'}</h3>
              <button
                onClick={() => setIsChildModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Child Name</label>
                <input
                  type="text"
                  placeholder="Leo Johnson"
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1.5">Select Character Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {AVATAR_OPTIONS.map((avatarPath) => (
                    <button
                      key={avatarPath}
                      type="button"
                      onClick={() => setChildForm({ ...childForm, avatar: avatarPath })}
                      className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition ${
                        childForm.avatar === avatarPath ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent opacity-70'
                      }`}
                    >
                      <Image src={avatarPath} alt="Avatar" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-normal text-slate-500 uppercase">8-Digit Access Code</label>
                  <button
                    type="button"
                    onClick={() => setChildForm({ ...childForm, studentCode: generate8DigitCode() })}
                    className="text-[10px] text-amber-700 font-normal flex items-center space-x-1 cursor-pointer"
                  >
                    <IconRefresh className="w-3 h-3" />
                    <span>Auto Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="58291039"
                  value={childForm.studentCode}
                  onChange={(e) => setChildForm({ ...childForm, studentCode: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono text-amber-950 tracking-widest outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Assigned World</label>
                <select
                  value={childForm.assignedWorldId}
                  onChange={(e) => setChildForm({ ...childForm, assignedWorldId: parseInt(e.target.value) })}
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
                  onClick={() => setIsChildModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition"
                >
                  {editingChild ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
