'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconKey,
  IconSearch,
  IconCopy,
  IconCheck,
  IconSchool,
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconX,
  IconUserCheck,
  IconUsers,
  IconBuildingSkyscraper,
  IconExternalLink,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { fetchGroupStudentsByCode } from '@/services/api';
import { getCharacterAvatarUrl } from '@/utils/cdn';

interface StudentItem {
  id: string;
  name: string;
  student_code: string;
  avatar: string;
  total_xp: number;
}

interface GroupInfo {
  id: number;
  name: string;
  code: string;
  centre_name?: string;
  school_name?: string;
}

export default function StudentCodesPage() {
  const router = useRouter();

  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [activeGroup, setActiveGroup] = useState<GroupInfo | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [nameSearch, setNameSearch] = useState('');
  
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const [visibleCodeStudentId, setVisibleCodeStudentId] = useState<string | null>(null);

  // Check URL query param e.g. /codes?code=grade-5-coding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setGroupCodeInput(codeParam);
      handleLookupGroup(codeParam);
    }
  }, []);

  const handleLookupGroup = async (codeToLookup?: string) => {
    const code = (codeToLookup || groupCodeInput).trim();
    if (!code) {
      setErrorMessage('Please enter your group code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await fetchGroupStudentsByCode(code);
    setIsLoading(false);

    if (!res.success || !res.group) {
      setErrorMessage(res.error || 'Group code not found. Please check with your instructor.');
      setActiveGroup(null);
      setStudents([]);
      return;
    }

    setActiveGroup(res.group);
    setStudents(res.students || []);
  };

  const handleCopyCode = (studentId: string, studentCode: string) => {
    if (!studentCode) return;
    navigator.clipboard.writeText(studentCode);
    setCopiedStudentId(studentId);
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  const filteredStudents = students.filter((s) => {
    const q = nameSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.student_code && s.student_code.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background QuickTime/MP4 Video with Dark Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover filter brightness-85 contrast-105 z-0"
        >
          <source src="/login_bg.mov" type="video/quicktime" />
          <source src="/login_bg.mov" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/85 to-slate-950/65 z-0" />
      </div>



      {/* Main Container Content */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Side Info Panel */}
        <div className="hidden md:flex max-w-lg flex-col gap-6 text-white animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Image
              src="/monkey1.svg"
              alt="PuzzlePro Logo"
              width={56}
              height={56}
              className="object-contain drop-shadow-md shrink-0 transition-transform hover:scale-105"
            />
            <span className="font-normal text-xs tracking-widest uppercase text-amber-300">
              Student Code Directory
            </span>
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-medium text-white leading-tight tracking-tight">
              Student Self-Service, <br />
              <span className="text-amber-400 font-medium">Instant Access Codes.</span>
            </h1>
            <p className="text-xs text-slate-200/90 mt-3 leading-relaxed font-normal">
              Enter your 6-digit class Group Code provided by your teacher to search your name, grab your 8-digit passwordless code, and jump right into coding!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Group Self-Service</span>
              <span className="text-[11px] text-slate-200/80">No need to wait for printed password sheets.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">Instant Name Search</span>
              <span className="text-[11px] text-slate-200/80">Type your name to locate your access code in seconds.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">One-Click Copy</span>
              <span className="text-[11px] text-slate-200/80">Click copy and paste your code directly into sign in.</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <span className="text-amber-300 font-medium block mb-1">6-Digit Serial Code</span>
              <span className="text-[11px] text-slate-200/80">Search by your class 6-digit serial number.</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-2">
            © 2026 PuzzlePro Student Directory. All rights reserved.
          </div>
        </div>

        {/* Right Side Glass Card (Step 1: Enter Group Code / Step 2: Student Directory) */}
        <div className="relative z-10 w-full max-w-[460px] bg-slate-900/80 md:bg-white/95 p-7 rounded-[28px] border border-white/20 md:border-white/60 shadow-2xl backdrop-blur-xl flex flex-col gap-5 animate-fade-in-up">
          
          {!activeGroup ? (
            /* STEP 1: ENTER GROUP CODE FORM */
            <div className="flex flex-col gap-4">
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <Image
                  src="/monkey1.svg"
                  alt="PuzzlePro Logo"
                  width={48}
                  height={48}
                  className="object-contain mb-2 drop-shadow-md shrink-0 transition-transform hover:scale-105"
                />
                <h2 className="text-xl font-medium text-white md:text-slate-900 tracking-tight">
                  Enter 6-Digit Group Code
                </h2>
                <p className="text-[10px] text-slate-400 md:text-slate-500 font-normal uppercase tracking-wide mt-0.5">
                  Get student access codes for your class
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookupGroup();
                }}
                className="space-y-4"
              >
                {errorMessage && (
                  <div className="bg-red-500/10 md:bg-red-50 text-red-400 md:text-red-700 text-[11px] font-normal p-3 rounded-xl border border-red-500/20 md:border-red-200 flex items-center gap-2 animate-fade-in-up">
                    <IconAlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-normal text-slate-300 md:text-slate-600 uppercase mb-1.5 tracking-wider">
                    6-Digit Serial Group Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 784912 or 592810"
                      value={groupCodeInput}
                      onChange={(e) => {
                        setGroupCodeInput(e.target.value);
                        setErrorMessage('');
                      }}
                      required
                      maxLength={12}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-sm text-sm font-mono font-bold tracking-widest text-white md:text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                    />
                    <IconKey className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !groupCodeInput.trim()}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-medium rounded-xl text-xs shadow-md border border-amber-600/30 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <IconLoader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Finding Group...</span>
                    </>
                  ) : (
                    <>
                      <IconSearch className="w-4 h-4 shrink-0" />
                      <span>Find My Group</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Quick Badges */}
              <div className="pt-2 border-t border-slate-200/40">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-normal">
                  Try Sample 6-Digit Group Codes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['784912', '592810', '310492'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setGroupCodeInput(sample);
                        handleLookupGroup(sample);
                      }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 md:text-amber-700 text-[11px] font-mono rounded-lg border border-amber-500/20 transition cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: GROUP FOUND & STUDENT DIRECTORY SEARCH */
            <div className="flex flex-col gap-4">
              {/* Back to Group Input */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveGroup(null);
                    setStudents([]);
                    setNameSearch('');
                  }}
                  className="text-xs text-slate-400 hover:text-white md:text-slate-600 md:hover:text-slate-900 transition flex items-center space-x-1 cursor-pointer"
                >
                  <IconArrowLeft className="w-3.5 h-3.5" />
                  <span>Enter Different Code</span>
                </button>

                <span className="text-[10px] bg-amber-500/20 text-amber-300 md:text-amber-800 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                  {activeGroup.code}
                </span>
              </div>

              {/* Group Title Card */}
              <div className="bg-slate-950/60 md:bg-slate-50 p-4 rounded-2xl border border-white/10 md:border-slate-200 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 md:text-amber-700 flex items-center justify-center shrink-0">
                  <IconSchool className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-medium text-white md:text-slate-900 truncate">
                    {activeGroup.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 md:text-slate-500 truncate flex items-center space-x-1">
                    <span>{activeGroup.school_name || 'School'}</span>
                    {activeGroup.centre_name && (
                      <>
                        <span>•</span>
                        <span>{activeGroup.centre_name}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Search Name Input */}
              <div>
                <label className="block text-[9px] font-normal text-slate-300 md:text-slate-600 uppercase mb-1 tracking-wider">
                  Search Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type your name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-xs font-normal text-white md:text-slate-900 placeholder:text-slate-400"
                  />
                  <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {nameSearch && (
                    <button
                      onClick={() => setNameSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white md:hover:text-slate-800"
                    >
                      <IconX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Students List Container */}
              <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredStudents.map((st) => {
                  const isCopied = copiedStudentId === st.id;
                  const isVisible = visibleCodeStudentId === st.id;
                  const formattedCode = st.student_code || '8492-1048';

                  return (
                    <div
                      key={st.id}
                      className="p-3 bg-slate-950/40 md:bg-white rounded-2xl border border-white/10 md:border-slate-200/90 shadow-xs flex items-center justify-between gap-2 hover:border-amber-400/50 transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                          <Image
                            src={getCharacterAvatarUrl(st.avatar)}
                            alt={st.name}
                            width={36}
                            height={36}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white md:text-slate-900 truncate">
                            {st.name}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-amber-400 md:text-amber-700 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {isVisible ? formattedCode : '••••-••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisibleCodeStudentId(isVisible ? null : st.id)}
                              className="text-slate-400 hover:text-white md:hover:text-slate-700"
                              title={isVisible ? 'Hide Code' : 'Show Code'}
                            >
                              {isVisible ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(st.id, formattedCode)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-1 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500'
                          }`}
                          title="Copy Access Code"
                        >
                          {isCopied ? (
                            <>
                              <IconCheck className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <IconCopy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-normal">
                    {nameSearch
                      ? `No student found matching "${nameSearch}".`
                      : 'No students registered in this group yet.'}
                  </div>
                )}
              </div>

              {/* Bottom Sign In Callout */}
              <div className="pt-3 border-t border-slate-200/40 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-normal">Got your code?</span>
                <Link
                  href="/schools"
                  className="text-amber-400 md:text-amber-700 font-medium hover:underline flex items-center space-x-1"
                >
                  <span>Go to Sign In →</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="relative z-20 w-full py-4 text-center text-[10px] text-slate-400 border-t border-white/10 bg-slate-950/60 backdrop-blur-md">
        © 2026 PuzzlePro Learning Platform. Operated by ResultsPro. All rights reserved.
      </footer>
    </main>
  );
}
