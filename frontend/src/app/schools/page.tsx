'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconSchool,
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
  IconFolderPlus,
  IconAlertCircle,
  IconX,
  IconCrown,
  IconLoader2,
  IconBuildingSkyscraper,
  IconMapPin,
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
  fetchCentres,
  saveCentre,
  deleteCentre,
  fetchGroups,
  saveGroup,
  updateOrgProfile,
  updateOrgPassword,
  fetchSubscriptions,
  saveSubscription,
  CentreApiItem,
  GroupApiItem,
} from '@/services/api';
import { authenticateUser } from '@/services/rbac';

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
];

export interface SchoolStudent {
  id: string;
  name: string;
  avatar: string;
  studentCode: string;
  groupName: string;
  centreId?: number;
  centreName?: string;
  assignedWorldId: number;
  totalXP: number;
}

export default function SchoolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'students' | 'groups' | 'centres' | 'profile'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCentreFilter, setSelectedCentreFilter] = useState<string>('ALL');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('School Dashboard');
  
  const [centresList, setCentresList] = useState<CentreApiItem[]>([]);
  const [groupsDetailList, setGroupsDetailList] = useState<GroupApiItem[]>([]);
  const [groupsList, setGroupsList] = useState<string[]>([
    'Grade 5 Coding Class',
    'Senior Coders Club',
    'STEM Lab 1',
  ]);

  const [students, setStudents] = useState<SchoolStudent[]>([]);

  // Student Modal state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<SchoolStudent | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: '',
    groupName: groupsList[0] || 'Grade 5 Coding Class',
    assignedWorldId: 1,
  });

  // Group Modal state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupApiItem | null>(null);
  const [groupForm, setGroupForm] = useState({
    id: 0,
    name: '',
    centreId: 0,
  });

  // Centre Modal state
  const [isCentreModalOpen, setIsCentreModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<CentreApiItem | null>(null);
  const [centreForm, setCentreForm] = useState({
    name: '',
    location: '',
    code: '',
  });

  // Profile & Password & Subscription state
  const [profileForm, setProfileForm] = useState({
    name: '',
    domain: '',
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
    planName: 'School Enterprise',
    seats: 100,
    price: '$299/mo',
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
      let orgs = await fetchOrganisations('school', orgId || undefined);
      if ((!orgs || orgs.length === 0) && !orgId) {
        orgs = await fetchOrganisations('school');
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
        setSchoolName(matching.name);

        setProfileForm({
          name: matching.name || '',
          domain: matching.domain || '',
          contactEmail: matching.contactEmail || '',
          contactPhone: matching.contactPhone || '',
          logoUrl: matching.logoUrl || '/monkey1.svg',
        });
      }

      // Read Centres from DB
      const remoteCentres = await fetchCentres(orgId || undefined);
      setCentresList(remoteCentres);

      // Read Groups from DB
      const remoteGroups = await fetchGroups(orgId || undefined);
      setGroupsDetailList(remoteGroups);
      if (remoteGroups.length > 0) {
        setGroupsList(remoteGroups.map((g) => g.name));
      }

      // Read Users / Students directly from Database
      const remoteUsers = await fetchUsers(orgId || undefined);
      const mapped: SchoolStudent[] = remoteUsers.map((u) => {
        const matchingGroup = remoteGroups.find((g) => g.name === u.groupName);
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar || '/images/character1.jpg',
          studentCode: u.studentCode,
          groupName: u.groupName || 'Grade 5 Coding Class',
          centreId: matchingGroup?.centreId || 0,
          centreName: matchingGroup?.centreName || '',
          assignedWorldId: u.assignedWorldId || 1,
          totalXP: u.totalXP || 100,
        };
      });
      setStudents(mapped);
    } catch (e) {}
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('puzzlepro_school_session');
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

    if (res.redirectUrl && !res.redirectUrl.startsWith('/schools')) {
      router.push(res.redirectUrl);
    } else {
      const targetOrgId = res.orgId || activeOrgId;
      setIsAuthenticated(true);
      localStorage.setItem('puzzlepro_school_session', 'authenticated');
      await loadDataFromDB(targetOrgId);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('puzzlepro_school_session');
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name) return;

    const finalCode = studentForm.studentCode || generate8DigitCode();
    await saveUser({
      id: editingStudent ? editingStudent.id : undefined,
      name: studentForm.name,
      avatar: studentForm.avatar,
      studentCode: finalCode,
      role: 'student',
      organisationId: activeOrgId,
      groupName: studentForm.groupName,
      assignedWorldId: studentForm.assignedWorldId,
    });

    setIsStudentModalOpen(false);
    setEditingStudent(null);
    setStudentForm({
      name: '',
      avatar: AVATAR_OPTIONS[0],
      studentCode: '',
      groupName: groupsList[0] || 'Grade 5 Coding Class',
      assignedWorldId: 1,
    });

    await loadDataFromDB(activeOrgId);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Delete student account?')) {
      await deleteUser(id);
      await loadDataFromDB(activeOrgId);
    }
  };

  const handleAssignWorld = async (id: string, worldId: number) => {
    await assignWorldApi(id, worldId);
    await loadDataFromDB(activeOrgId);
  };

  const handleSaveGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) return;

    const selectedCentre = centresList.find((c) => c.id === groupForm.centreId);
    await saveGroup({
      id: groupForm.id || 0,
      organisationId: activeOrgId,
      centreId: groupForm.centreId || undefined,
      centreName: selectedCentre?.name || '',
      name: groupForm.name,
    });

    setIsGroupModalOpen(false);
    setEditingGroup(null);
    setGroupForm({ id: 0, name: '', centreId: 0 });
    await loadDataFromDB(activeOrgId);
  };

  const handleSaveCentreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centreForm.name) return;

    await saveCentre({
      id: editingCentre ? editingCentre.id : 0,
      organisationId: activeOrgId,
      name: centreForm.name,
      location: centreForm.location,
      code: centreForm.code,
    });

    setIsCentreModalOpen(false);
    setEditingCentre(null);
    setCentreForm({ name: '', location: '', code: '' });
    await loadDataFromDB(activeOrgId);
  };

  const handleDeleteCentre = async (id: number) => {
    if (confirm('Are you sure you want to delete this Campus Centre location?')) {
      await deleteCentre(id);
      await loadDataFromDB(activeOrgId);
    }
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) return;
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    const success = await updateOrgProfile({
      id: activeOrgId,
      name: profileForm.name,
      domain: profileForm.domain,
      contactEmail: profileForm.contactEmail,
      contactPhone: profileForm.contactPhone,
      logoUrl: profileForm.logoUrl,
    });

    setIsUpdatingProfile(false);
    if (success) {
      setSchoolName(profileForm.name);
      setProfileMsg({ type: 'success', text: 'School profile & branding details updated successfully!' });
      await loadDataFromDB(activeOrgId);
    } else {
      setProfileMsg({ type: 'error', text: 'Failed to update school profile details. Please try again.' });
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
      setSubMsg({ type: 'success', text: `Subscription successfully updated to ${planName}!` });
    } else {
      setSubMsg({ type: 'error', text: 'Failed to update subscription plan.' });
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'ALL' || s.groupName === selectedGroupFilter;
    const matchesCentre =
      selectedCentreFilter === 'ALL' || (s.centreId && s.centreId.toString() === selectedCentreFilter);
    return matchesSearch && matchesGroup && matchesCentre;
  });

  const filteredGroups = groupsDetailList.filter((g) => {
    return selectedCentreFilter === 'ALL' || (g.centreId && g.centreId.toString() === selectedCentreFilter);
  });

  // Full-screen glassmorphic video background login screen
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
              PuzzlePro Schools
            </span>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-medium text-white leading-tight tracking-tight">
              Educator Portal, <br />
              <span className="text-amber-400 font-medium">Inspiring Young Coders.</span>
            </h1>
            <p className="text-xs text-slate-200/90 mt-3 leading-relaxed font-normal">
              Manage school campus centres, student access codes, organize classes, and assign interactive coding worlds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Centres & Locations</span>
              <span className="text-[11px] text-slate-200/80">Manage multiple school campuses & learning hubs.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Class & Group Management</span>
              <span className="text-[11px] text-slate-200/80">Tie Grade 5, Robotics, or STEM labs to specific centres.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">8-Digit Access Codes</span>
              <span className="text-[11px] text-slate-200/80">Generate & copy instant passwordless access codes.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">XP Progress Tracking</span>
              <span className="text-[11px] text-slate-200/80">Monitor student coding milestones & total XP.</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-2">
            © 2026 PuzzlePro Schools Portal. All rights reserved.
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[380px] bg-slate-900/80 md:bg-white/90 p-7 rounded-[28px] border border-white/20 md:border-white/60 shadow-2xl backdrop-blur-xl flex flex-col gap-4 animate-fade-in-up">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Image src="/monkey1.svg" alt="PuzzlePro Logo" width={48} height={48} className="object-contain mb-2 drop-shadow-md shrink-0 transition-transform hover:scale-105" />
            <h2 className="text-xl font-medium text-white md:text-slate-900 tracking-tight">Schools Portal</h2>
            <p className="text-[10px] text-slate-400 md:text-slate-500 font-normal uppercase tracking-wide mt-0.5">
              Sign in to educator portal
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
                Educator Email
              </label>
              <input
                type="email"
                placeholder="teacher@school.edu"
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
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs shadow-md border border-amber-500/40 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoggingIn ? (
                <IconLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Sign In to School</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Image src="/monkey1.svg" alt="PuzzlePro" width={44} height={44} className="object-contain" />
          <div>
            <h1 className="text-base font-medium text-slate-900">{schoolName}</h1>
            <p className="text-[11px] text-slate-500 font-normal">Educator & School Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal flex items-center space-x-1.5 border border-slate-200 cursor-pointer"
          >
            <IconLogout className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-fade-in-up">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Campus Centres</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{centresList.length} Locations</h3>
              <p className="text-[11px] font-normal text-emerald-600 mt-0.5">School Campuses Active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IconBuildingSkyscraper className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Classes & Groups</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{groupsDetailList.length} Active Groups</h3>
              <p className="text-[11px] font-normal text-purple-600 mt-0.5">Tied to Campus Centres</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IconSchool className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{students.length} Students</h3>
              <p className="text-[11px] font-normal text-blue-600 mt-0.5">8-Digit Access Codes Active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <IconUsers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Learning Worlds</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">5 Gamified Worlds</h3>
              <p className="text-[11px] font-normal text-amber-600 mt-0.5">Assigned per Class</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <IconWorld className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-6 w-full sm:w-auto px-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'students' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>Student Roster & Access Codes</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'groups' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconSchool className="w-4 h-4" />
              <span>School Classes & Groups</span>
            </button>

            <button
              onClick={() => setActiveTab('centres')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 shrink-0 ${
                activeTab === 'centres' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconBuildingSkyscraper className="w-4 h-4" />
              <span>Campus Centres & Locations</span>
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
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* TAB 1: STUDENT ROSTER */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900">Student Roster</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Manage 8-digit access codes, assign Learning Worlds, and track student XP across Campus Centres.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingStudent(null);
                  setStudentForm({
                    name: '',
                    avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
                    studentCode: generate8DigitCode(),
                    groupName: groupsList[0] || 'Grade 5 Coding Class',
                    assignedWorldId: 1,
                  });
                  setIsStudentModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Campus Centre:</span>
                <select
                  value={selectedCentreFilter}
                  onChange={(e) => setSelectedCentreFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Campus Locations ({centresList.length})</option>
                  {centresList.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Class / Group:</span>
                <select
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All School Classes ({groupsList.length})</option>
                  {groupsList.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">8-Digit Access Code</th>
                    <th className="py-3 px-3">Class & Location Centre</th>
                    <th className="py-3 px-3">Assigned World</th>
                    <th className="py-3 px-3">XP Score</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full relative overflow-hidden border border-slate-200 shrink-0">
                            <Image src={st.avatar} alt={st.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 block">{st.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-amber-700">
                        <div className="flex items-center space-x-1.5">
                          <span>{st.studentCode}</span>
                          <button
                            onClick={() => copyCode(st.id, st.studentCode)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                            title="Copy 8-Digit Access Code"
                          >
                            {copiedCodeId === st.id ? <IconCheck className="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px] font-medium w-fit">
                            {st.groupName}
                          </span>
                          {st.centreName && (
                            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-normal">
                              <IconMapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{st.centreName}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={st.assignedWorldId}
                          onChange={(e) => handleAssignWorld(st.id, parseInt(e.target.value))}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-950 font-normal rounded-xl text-xs outline-none cursor-pointer"
                        >
                          <option value={1}>World 1 (Monkey Explorers)</option>
                          <option value={2}>World 2 (HTML Architects)</option>
                          <option value={3}>World 3 (CSS Stylists)</option>
                          <option value={4}>World 4 (JS Logic Wizards)</option>
                          <option value={5}>World 5 (Python Masters)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-amber-600">{st.totalXP} XP</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingStudent(st);
                              setStudentForm({
                                name: st.name,
                                avatar: st.avatar,
                                studentCode: st.studentCode,
                                groupName: st.groupName,
                                assignedWorldId: st.assignedWorldId,
                              });
                              setIsStudentModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-normal">
                        No students found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GROUPS MANAGEMENT */}
        {activeTab === 'groups' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900">School Classes & Groups</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Organize your students into classes and tie each class to a Campus Centre location.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupForm({
                    id: 0,
                    name: '',
                    centreId: centresList[0]?.id || 0,
                  });
                  setIsGroupModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition cursor-pointer"
              >
                <IconFolderPlus className="w-4 h-4" />
                <span>Create New Class</span>
              </button>
            </div>

            {/* Centre Filter */}
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Filter by Centre Location:</span>
              <select
                value={selectedCentreFilter}
                onChange={(e) => setSelectedCentreFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none cursor-pointer"
              >
                <option value="ALL">All Campus Centres ({centresList.length})</option>
                {centresList.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredGroups.map((grp) => {
                const count = students.filter((s) => s.groupName === grp.name).length;
                return (
                  <div key={grp.id || grp.name} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 hover:border-amber-300 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase">Class</span>
                        {grp.centreName && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                            <IconMapPin className="w-3 h-3 shrink-0" />
                            <span>{grp.centreName}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-slate-900 mt-2">{grp.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{count} Students Enrolled</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          setSelectedGroupFilter(grp.name);
                          setActiveTab('students');
                        }}
                        className="text-xs text-amber-700 hover:text-amber-800 font-normal text-left cursor-pointer"
                      >
                        View Students →
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroup(grp);
                          setGroupForm({
                            id: grp.id,
                            name: grp.name,
                            centreId: grp.centreId || 0,
                          });
                          setIsGroupModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredGroups.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-normal">
                  No school classes found for selected campus centre.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CENTRES MANAGEMENT */}
        {activeTab === 'centres' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900">Campus Centres & Locations</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Manage multiple school campuses, branch locations, and physical learning hubs.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCentre(null);
                  setCentreForm({ name: '', location: '', code: '' });
                  setIsCentreModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Campus Centre</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {centresList.map((ctr) => {
                const tiedGroups = groupsDetailList.filter((g) => g.centreId === ctr.id);
                return (
                  <div key={ctr.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 hover:border-emerald-300 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                          <IconBuildingSkyscraper className="w-3 h-3 shrink-0" />
                          <span>Centre Location</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{ctr.code || 'MAIN'}</span>
                      </div>
                      <h3 className="text-base font-medium text-slate-900 mt-2">{ctr.name}</h3>
                      {ctr.location && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-normal">
                          <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ctr.location}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-purple-700 mt-2 font-medium">
                        {tiedGroups.length} Tied School Classes
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          setEditingCentre(ctr);
                          setCentreForm({
                            name: ctr.name,
                            location: ctr.location || '',
                            code: ctr.code || '',
                          });
                          setIsCentreModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCentre(ctr.id)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {centresList.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-normal">
                  No campus centres added yet. Click "+ Add Campus Centre" to add your first school location.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & BILLING SETTINGS */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Header banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 p-2 flex items-center justify-center shadow-xs">
                  <Image src={profileForm.logoUrl || '/monkey1.svg'} alt="School Logo" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{profileForm.name || schoolName}</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5 flex items-center space-x-2">
                    <span>{profileForm.contactEmail || 'admin@school.edu'}</span>
                    <span>•</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-medium">School Account</span>
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
              {/* Profile & Branding Details Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <IconSettings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">School Profile & Branding</h3>
                    <p className="text-[11px] text-slate-500">Update school logo, domain, and contact info</p>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {profileMsg.type === 'success' ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconAlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfileSubmit} className="flex flex-col gap-4">
                  {/* Logo Avatar Quick Choice */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">School Logo / Character Avatar</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['/monkey1.svg', '/lion1.svg', '/penguin1.svg', '/panda1.svg', '/bear1.svg', '/fox1.svg'].map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, logoUrl: img })}
                          className={`w-11 h-11 rounded-2xl p-1 border transition-all cursor-pointer ${profileForm.logoUrl === img ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <Image src={img} alt="Logo option" width={36} height={36} className="object-contain w-full h-full" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter custom image URL (https://...)"
                      value={profileForm.logoUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">School / Institution Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Primary Domain (Allowed Origin)</label>
                    <input
                      type="text"
                      placeholder="e.g. stemexplorers.edu"
                      value={profileForm.domain}
                      onChange={(e) => setProfileForm({ ...profileForm, domain: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={profileForm.contactEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
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
                    {isUpdatingProfile ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <span>Save Profile Details</span>}
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
                      <p className="text-[11px] text-slate-500">Update your school account password</p>
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
                      <p className="text-[11px] text-slate-500">View capacity seats & upgrade plans instantly</p>
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
                      <span>Seats Capacity: <strong>{subscriptionDetails.seats} Student Seats</strong></span>
                      <span>Renewal: <strong>{subscriptionDetails.renewalDate}</strong></span>
                    </div>
                  </div>

                  {/* Upgrade Plans Options */}
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { name: 'Free Starter', seats: 5, price: '$0/mo' },
                      { name: 'Pro Explorer', seats: 25, price: '$99/mo' },
                      { name: 'School Enterprise', seats: 100, price: '$299/mo' },
                    ].map((plan) => (
                      <button
                        key={plan.name}
                        onClick={() => handleUpgradeSubscriptionPlan(plan.name, plan.seats, plan.price)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${subscriptionDetails.planName === plan.name ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">{plan.name}</div>
                          <div className="text-[10px] text-slate-500">{plan.seats} Seats</div>
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

      {/* Add/Edit Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
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
                      onClick={() => setStudentForm({ ...studentForm, avatar: avatarPath })}
                      className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition cursor-pointer ${
                        studentForm.avatar === avatarPath ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent opacity-70'
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
                    onClick={() => setStudentForm({ ...studentForm, studentCode: generate8DigitCode() })}
                    className="text-[10px] text-amber-700 font-normal flex items-center space-x-1 cursor-pointer"
                  >
                    <IconRefresh className="w-3 h-3" />
                    <span>Auto Generate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="83920193"
                  value={studentForm.studentCode}
                  onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono text-amber-950 tracking-widest outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Class / Group</label>
                  <select
                    value={studentForm.groupName}
                    onChange={(e) => setStudentForm({ ...studentForm, groupName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                  >
                    {groupsList.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Assigned World</label>
                  <select
                    value={studentForm.assignedWorldId}
                    onChange={(e) => setStudentForm({ ...studentForm, assignedWorldId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-amber-50 border border-amber-300 font-normal text-amber-950 rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value={1}>World 1 (Monkey Explorers)</option>
                    <option value={2}>World 2 (HTML Architects)</option>
                    <option value={3}>World 3 (CSS Stylists)</option>
                    <option value={4}>World 4 (JS Logic Wizards)</option>
                    <option value={5}>World 5 (Python Masters)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">{editingGroup ? 'Edit School Class' : 'Create New School Class'}</h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Class / Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Class 6A"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Tie to Campus Centre Location</label>
                <select
                  value={groupForm.centreId}
                  onChange={(e) => setGroupForm({ ...groupForm, centreId: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value={0}>No Specific Centre (General)</option>
                  {centresList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.location ? `(${c.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition cursor-pointer"
                >
                  {editingGroup ? 'Save Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Centre Modal */}
      {isCentreModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">{editingCentre ? 'Edit Campus Centre' : 'Add Campus Centre Location'}</h3>
              <button
                onClick={() => setIsCentreModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCentreSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Centre Name</label>
                <input
                  type="text"
                  placeholder="e.g. Main Campus / Lagos West Hub"
                  value={centreForm.name}
                  onChange={(e) => setCentreForm({ ...centreForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Location Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12 Central Avenue, Victoria Island"
                  value={centreForm.location}
                  onChange={(e) => setCentreForm({ ...centreForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Centre Code</label>
                <input
                  type="text"
                  placeholder="e.g. main-campus"
                  value={centreForm.code}
                  onChange={(e) => setCentreForm({ ...centreForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCentreModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition cursor-pointer"
                >
                  {editingCentre ? 'Save Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
