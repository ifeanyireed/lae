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
  IconArrowLeft,
  IconCrown,
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
  '/images/character9.jpg',
  '/images/character10.jpg',
  '/images/cowboy_avatar.jpg',
  '/images/pirate_avatar.jpg',
  '/images/viking_avatar.jpg',
];

export interface SchoolStudent {
  id: string;
  name: string;
  avatar: string;
  studentCode: string;
  groupName: string;
  assignedWorldId: number;
  totalXP: number;
}

export default function SchoolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'students' | 'groups'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [schoolName, setSchoolName] = useState('STEM Explorers Academy');
  const [groupsList, setGroupsList] = useState<string[]>([
    'Grade 5 Coding Class',
    'Senior Coders Club',
    'STEM Lab 1',
  ]);

  const [students, setStudents] = useState<SchoolStudent[]>([]);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<SchoolStudent | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: '',
    groupName: groupsList[0] || 'Grade 5 Coding Class',
    assignedWorldId: 1,
  });

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('puzzlepro_school_session');
      if (savedAuth === 'authenticated') {
        setIsAuthenticated(true);
      }

      const savedStudents = localStorage.getItem('puzzlepro_school_students');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        const initialStudents: SchoolStudent[] = [
          {
            id: 'st_1',
            name: 'Alex Johnson',
            avatar: '/images/character1.jpg',
            studentCode: '83920193',
            groupName: 'Grade 5 Coding Class',
            assignedWorldId: 1,
            totalXP: 450,
          },
          {
            id: 'st_2',
            name: 'Sarah Williams',
            avatar: '/images/character2.jpg',
            studentCode: '47201948',
            groupName: 'Senior Coders Club',
            assignedWorldId: 2,
            totalXP: 820,
          },
          {
            id: 'st_3',
            name: 'David Chen',
            avatar: '/images/character3.jpg',
            studentCode: '91823746',
            groupName: 'STEM Lab 1',
            assignedWorldId: 3,
            totalXP: 1200,
          },
          {
            id: 'st_4',
            name: 'Maya Patel',
            avatar: '/images/character6.jpg',
            studentCode: '74019283',
            groupName: 'Grade 5 Coding Class',
            assignedWorldId: 5,
            totalXP: 1350,
          },
        ];
        setStudents(initialStudents);
        localStorage.setItem('puzzlepro_school_students', JSON.stringify(initialStudents));
      }
    } catch (e) {}
  }, []);

  const saveStudents = (newStudents: SchoolStudent[]) => {
    setStudents(newStudents);
    try {
      localStorage.setItem('puzzlepro_school_students', JSON.stringify(newStudents));
    } catch (e) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail || loginPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('puzzlepro_school_session', 'authenticated');
    }
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

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name) return;

    const finalCode = studentForm.studentCode || generate8DigitCode();

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              name: studentForm.name,
              avatar: studentForm.avatar,
              studentCode: finalCode,
              groupName: studentForm.groupName,
              assignedWorldId: studentForm.assignedWorldId,
            }
          : s
      );
      saveStudents(updated);
    } else {
      const newSt: SchoolStudent = {
        id: `st_${Date.now()}`,
        name: studentForm.name,
        avatar: studentForm.avatar,
        studentCode: finalCode,
        groupName: studentForm.groupName,
        assignedWorldId: studentForm.assignedWorldId,
        totalXP: 100,
      };
      saveStudents([...students, newSt]);
    }

    setIsStudentModalOpen(false);
    setEditingStudent(null);
    setStudentForm({
      name: '',
      avatar: AVATAR_OPTIONS[0],
      studentCode: '',
      groupName: groupsList[0] || 'Grade 5 Coding Class',
      assignedWorldId: 1,
    });
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Delete student account?')) {
      saveStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleAssignWorld = (id: string, worldId: number) => {
    const updated = students.map((s) => (s.id === id ? { ...s, assignedWorldId: worldId } : s));
    saveStudents(updated);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    if (!groupsList.includes(newGroupName)) {
      setGroupsList([...groupsList, newGroupName]);
    }
    setNewGroupName('');
    setIsGroupModalOpen(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'ALL' || s.groupName === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 z-0" />
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-2xl flex flex-col gap-5 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Image src="/monkey1.svg" alt="PuzzlePro" width={44} height={44} className="object-contain" />
            <div>
              <h1 className="text-xl font-medium text-slate-900">Schools Portal</h1>
              <p className="text-xs text-slate-500 font-normal">Manage student rosters & learning worlds</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-normal text-slate-600 uppercase mb-1">School Educator Email</label>
              <input
                type="email"
                placeholder="teacher@school.edu"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-normal text-slate-600 uppercase mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium rounded-xl text-xs border border-amber-500 shadow-sm transition-all"
            >
              Sign In to School Portal
            </button>
          </form>

          <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-xs text-slate-500">
            <Link href="/controls" className="hover:text-amber-600 transition flex items-center space-x-1">
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Controls</span>
            </Link>
            <Link href="/families" className="hover:text-amber-600 transition">
              Families Portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Light Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Image src="/monkey1.svg" alt="PuzzlePro" width={44} height={44} className="object-contain" />
          <div>
            <h1 className="text-base font-medium text-slate-900">{schoolName}</h1>
            <p className="text-[11px] text-slate-500 font-normal">Educator & School Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/controls"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-normal transition border border-slate-200"
          >
            Admin Controls
          </Link>
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
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{students.length} Students</h3>
              <p className="text-[11px] font-normal text-emerald-600 mt-0.5">8-Digit Access Codes Active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <IconUsers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">School Classes / Groups</p>
              <h3 className="text-2xl font-medium text-slate-900 mt-1">{groupsList.length} Active Groups</h3>
              <p className="text-[11px] font-normal text-purple-600 mt-0.5">Class Assignments</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <IconSchool className="w-6 h-6" />
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
          <div className="flex items-center space-x-6 w-full sm:w-auto px-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 ${
                activeTab === 'students' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconUsers className="w-4 h-4" />
              <span>Student Roster & Access Codes</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`py-1.5 text-xs transition flex items-center space-x-2 cursor-pointer border-b-2 ${
                activeTab === 'groups' ? 'text-amber-600 border-amber-500 font-medium' : 'text-slate-500 border-transparent font-normal'
              }`}
            >
              <IconSchool className="w-4 h-4" />
              <span>School Classes & Groups</span>
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
                  Manage 8-digit access codes, assign Learning Worlds, and track student XP.
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
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Filter by Group */}
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">Filter by Class:</span>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">8-Digit Access Code</th>
                    <th className="py-3 px-3">Class / Group</th>
                    <th className="py-3 px-3">Assigned World</th>
                    <th className="py-3 px-3">Total XP</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 relative shrink-0 overflow-hidden shadow-xs">
                            <Image src={st.avatar} alt={st.name} fill className="object-cover" />
                          </div>
                          <span className="font-normal text-slate-900">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-amber-100/80 border border-amber-300 text-amber-950 font-mono text-xs px-2.5 py-1 rounded-xl tracking-widest shadow-xs">
                            {st.studentCode}
                          </span>
                          <button
                            onClick={() => copyCode(st.id, st.studentCode)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Copy 8-Digit Access Code"
                          >
                            {copiedCodeId === st.id ? <IconCheck className="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px]">
                          {st.groupName}
                        </span>
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
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
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
                        No students found matching class filters.
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-base font-medium text-slate-900">School Classes & Groups</h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Organize your students into classes and assign learning tracks.
                </p>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal text-xs flex items-center space-x-1.5 border border-amber-500 shadow-sm transition"
              >
                <IconFolderPlus className="w-4 h-4" />
                <span>Create New Class</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {groupsList.map((grp) => {
                const count = students.filter((s) => s.groupName === grp).length;
                return (
                  <div key={grp} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
                    <div>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase">Class</span>
                      <h3 className="text-base font-medium text-slate-900 mt-2">{grp}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{count} Students Enrolled</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGroupFilter(grp);
                        setActiveTab('students');
                      }}
                      className="text-xs text-amber-700 hover:text-amber-800 font-normal text-left cursor-pointer"
                    >
                      View Students in Class →
                    </button>
                  </div>
                );
              })}
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
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
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
                      className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition ${
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
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
                    className="w-full px-3 py-2.5 bg-amber-50 border border-amber-300 font-normal text-amber-950 rounded-xl text-xs outline-none"
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
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <h3 className="font-medium text-slate-900 text-base">Create New School Class</h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Class / Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Class 6A"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-normal rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-sm transition"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
