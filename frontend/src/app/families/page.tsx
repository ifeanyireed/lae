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
} from '@tabler/icons-react';

const AVATAR_OPTIONS = [
  '/images/character1.jpg',
  '/images/character2.jpg',
  '/images/character3.jpg',
  '/images/character4.jpg',
  '/images/character5.jpg',
  '/images/character6.jpg',
  '/images/character7.jpg',
  '/images/character8.jpg',
  '/images/cowboy_avatar.jpg',
  '/images/pirate_avatar.jpg',
  '/images/viking_avatar.jpg',
  '/images/indie_character.jpg',
];

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

  const [children, setChildren] = useState<ChildAccount[]>([]);

  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildAccount | null>(null);
  const [childForm, setChildForm] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: '',
    assignedWorldId: 1,
  });

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('puzzlepro_family_session');
      if (savedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }

      const savedChildren = localStorage.getItem('puzzlepro_family_children');
      if (savedChildren) {
        setChildren(JSON.parse(savedChildren));
      } else {
        const initialChildren: ChildAccount[] = [
          {
            id: 'ch_1',
            name: 'Leo Johnson',
            avatar: '/images/character1.jpg',
            studentCode: '58291039',
            assignedWorldId: 1,
            totalXP: 320,
          },
          {
            id: 'ch_2',
            name: 'Chloe Johnson',
            avatar: '/images/character5.jpg',
            studentCode: '92019482',
            assignedWorldId: 2,
            totalXP: 750,
          },
        ];
        setChildren(initialChildren);
        localStorage.setItem('puzzlepro_family_children', JSON.stringify(initialChildren));
      }
    } catch (e) {}
  }, []);

  const saveChildren = (newChildren: ChildAccount[]) => {
    setChildren(newChildren);
    try {
      localStorage.setItem('puzzlepro_family_children', JSON.stringify(newChildren));
    } catch (e) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both parent email and password.');
      return;
    }
    setIsLoggingIn(true);
    setAuthError('');
    setTimeout(() => {
      setIsAuthenticated(true);
      localStorage.setItem('puzzlepro_family_session', 'authenticated');
      setIsLoggingIn(false);
    }, 450);
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

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.name) return;

    const finalCode = childForm.studentCode || generate8DigitCode();

    if (editingChild) {
      const updated = children.map((c) =>
        c.id === editingChild.id
          ? {
              ...c,
              name: childForm.name,
              avatar: childForm.avatar,
              studentCode: finalCode,
              assignedWorldId: childForm.assignedWorldId,
            }
          : c
      );
      saveChildren(updated);
    } else {
      const newChild: ChildAccount = {
        id: `ch_${Date.now()}`,
        name: childForm.name,
        avatar: childForm.avatar,
        studentCode: finalCode,
        assignedWorldId: childForm.assignedWorldId,
        totalXP: 100,
      };
      saveChildren([...children, newChild]);
    }

    setIsChildModalOpen(false);
    setEditingChild(null);
    setChildForm({
      name: '',
      avatar: AVATAR_OPTIONS[0],
      studentCode: '',
      assignedWorldId: 1,
    });
  };

  const handleDeleteChild = (id: string) => {
    if (confirm("Delete child's account?")) {
      saveChildren(children.filter((c) => c.id !== id));
    }
  };

  const handleAssignWorld = (id: string, worldId: number) => {
    const updated = children.map((c) => (c.id === id ? { ...c, assignedWorldId: worldId } : c));
    saveChildren(updated);
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

          <p className="text-[10px] text-center md:text-left text-slate-400 md:text-slate-500 font-normal mt-0.5">
            Default credentials: <span className="font-normal text-amber-500 md:text-slate-900">parent@family.com / parent123</span>
          </p>
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
            <h1 className="text-base font-medium text-slate-900">Family Portal</h1>
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
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IconHeartHandshake className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Learning Worlds</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">Worlds 1 – 5</h3>
              <p className="text-[11px] font-normal text-amber-600 mt-0.5">Custom World Assignments</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <IconCrown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Children Management Box */}
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
