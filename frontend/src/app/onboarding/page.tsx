'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveOrganisation, saveUser, saveBatchUsers, sendVerificationCode, verifyEmailCode } from '@/services/api';
import {
  IconSchool,
  IconHeartHandshake,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconUsers,
  IconWorld,
  IconRefresh,
  IconCopy,
  IconSparkles,
  IconShieldCheck,
  IconPlus,
  IconTrash,
  IconMailCheck,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';

const AVATAR_OPTIONS = Array.from(
  { length: 20 },
  (_, i) => `https://raw.githubusercontent.com/ifeanyireed/lae/main/frontend/public/images/character${i + 1}.jpg`
);

export default function OnboardingPage() {
  const router = useRouter();

  // Multi-step wizard state (1 to 4)
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<'school' | 'family'>('school');

  // Step 2 Form - Details
  const [schoolData, setSchoolData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    domain: '',
    password: '',
  });

  const [familyData, setFamilyData] = useState({
    parentName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Step 3 Form - Multiple Children / Students
  const [childrenList, setChildrenList] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    studentCode: string;
    className: string;
    assignedWorldId: number;
  }>>([
    {
      id: 'child_1',
      name: '',
      avatar: AVATAR_OPTIONS[0],
      studentCode: Math.floor(10000000 + Math.random() * 90000000).toString(),
      className: 'Grade 5 Coding Class',
      assignedWorldId: 1,
    },
  ]);

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const addChild = () => {
    const nextIdx = childrenList.length + 1;
    setChildrenList((prev) => [
      ...prev,
      {
        id: `child_${Date.now()}_${nextIdx}`,
        name: '',
        avatar: AVATAR_OPTIONS[(nextIdx - 1) % AVATAR_OPTIONS.length],
        studentCode: generate8DigitCode(),
        className: role === 'school' ? `Grade 5 Class ${nextIdx}` : 'Kids Group',
        assignedWorldId: 1,
      },
    ]);
  };

  const updateChild = (id: string, fields: Partial<(typeof childrenList)[0]>) => {
    setChildrenList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...fields } : item))
    );
  };

  const removeChild = (id: string) => {
    if (childrenList.length <= 1) {
      alert('At least one child / student account is required.');
      return;
    }
    setChildrenList((prev) => prev.filter((item) => item.id !== id));
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Email verification state
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [verificationMsg, setVerificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  // Step Navigation
  const handleNext = async () => {
    if (step === 2) {
      const email = role === 'school' ? schoolData.email : familyData.email;
      const pwd = role === 'school' ? schoolData.password : familyData.password;
      const name = role === 'school' ? schoolData.name : familyData.parentName;

      if (!name || !email || !pwd) {
        alert(role === 'school' ? 'Please fill in school name, educator email, and create a password.' : 'Please fill in parent name, email, and create a password.');
        return;
      }

      if (!isEmailVerified) {
        setIsSendingCode(true);
        setVerificationMsg(null);
        const res = await sendVerificationCode(email);
        setIsSendingCode(false);

        if (res.success) {
          setShowVerificationModal(true);
          if (res.code) {
            setDemoCodeHint(res.code);
            setVerificationCode(res.code);
          }
          setVerificationMsg({ type: 'success', text: `A 6-digit OTP code has been dispatched to ${email}` });
        } else {
          alert(`Failed to send verification code: ${res.error || 'Please try again'}`);
        }
        return;
      }
    }
    if (step === 3) {
      const emptyChild = childrenList.find((c) => !c.name.trim());
      if (emptyChild) {
        alert(role === 'school' ? 'Please enter names for all students.' : 'Please enter names for all children.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleVerifyCodeSubmit = async () => {
    const email = role === 'school' ? schoolData.email : familyData.email;
    if (!verificationCode || verificationCode.length < 4) {
      setVerificationMsg({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }

    setIsVerifyingCode(true);
    const res = await verifyEmailCode(email, verificationCode);
    setIsVerifyingCode(false);

    if (res.success) {
      setIsEmailVerified(true);
      setShowVerificationModal(false);
      setStep(3);
    } else {
      setVerificationMsg({ type: 'error', text: res.error || 'Invalid or expired verification code.' });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteOnboarding = async () => {
    const orgId = `org_${Date.now().toString().slice(-4)}`;
    const name = role === 'school' ? (schoolData.name || 'New School Academy') : (familyData.parentName || 'Happy Family Account');
    const email = role === 'school' ? schoolData.email : familyData.email;
    const phone = role === 'school' ? schoolData.phone : familyData.phone;
    const domain = role === 'school' ? schoolData.domain : '';
    const pwd = role === 'school' ? (schoolData.password || 'school123') : (familyData.password || 'parent123');

    await saveOrganisation({
      id: orgId,
      name: name,
      domain: domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactEmail: email || 'contact@puzzlepro.ng',
      contactPhone: phone || '+1 (555) 000-0000',
      password: pwd,
      type: role,
      token: `TOKEN_${name.substring(0, Math.min(4, name.length)).toUpperCase()}_9901`,
      groups: role === 'school' ? [childrenList[0]?.className || 'Grade 5 Coding Class'] : ['Kids Group'],
    });

    await saveBatchUsers(
      orgId,
      childrenList.map((c, idx) => ({
        name: c.name || (role === 'school' ? `Student ${idx + 1}` : `Child ${idx + 1}`),
        avatar: c.avatar,
        studentCode: c.studentCode,
        role: 'student',
        organisationId: orgId,
        groupName: role === 'school' ? (c.className || 'Grade 5 Coding Class') : 'Kids Group',
        assignedWorldId: c.assignedWorldId,
      }))
    );

    sessionStorage.setItem('puzzlepro_active_org_id', orgId);
    localStorage.setItem('puzzlepro_active_org_id', orgId);

    if (role === 'school') {
      localStorage.setItem('puzzlepro_school_session', 'authenticated');
      router.push(`/schools?orgId=${orgId}`);
    } else {
      localStorage.setItem('puzzlepro_family_session', 'authenticated');
      router.push(`/families?orgId=${orgId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col justify-between p-4 sm:p-8 relative overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <Image src="/monkey1.svg" alt="PuzzlePro" width={48} height={48} className="object-contain" />
          <div>
            <h1 className="text-lg font-medium text-slate-900 tracking-tight">PuzzlePro Setup</h1>
            <p className="text-xs text-slate-500 font-normal">One-Page Guided Onboarding</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="hidden sm:flex items-center space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                s === step
                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-sm scale-105'
                  : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s < step ? <IconCheck className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </header>

      {/* Main Wizard Card */}
      <main className="max-w-2xl w-full mx-auto my-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl flex flex-col gap-6 animate-fade-in-up">
        {/* Progress Bar (Mobile) */}
        <div className="sm:hidden flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-150">
          <span>Step {step} of 4</span>
          <span className="font-medium text-amber-600">
            {step === 1 && 'Select Account Type'}
            {step === 2 && 'Organization Details'}
            {step === 3 && 'Account & World Setup'}
            {step === 4 && 'Onboarding Complete'}
          </span>
        </div>

        {/* STEP 1: SELECT ACCOUNT TYPE */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Welcome to PuzzlePro!</h2>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Choose how you will be using PuzzlePro to get your tailored workspace set up in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setRole('school')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
                  role === 'school'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <IconSchool className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-slate-900">School Administrator or Educator</h3>
                  <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                    Set up school classes, manage student rosters, assign 8-digit access codes, and monitor coding XP progress across grade levels.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setRole('family')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
                  role === 'family'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <IconHeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-slate-900">Parent or Family Guardian</h3>
                  <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                    Create child profiles, manage safe 8-digit access codes, and assign gamified Learning Worlds for home coding fun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                {role === 'school' ? 'School & Organization Details' : 'Family & Parent Profile'}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1">
                {role === 'school'
                  ? 'Enter your school information to generate your unique embed token and portal access.'
                  : 'Enter your parent details to configure your family workspace.'}
              </p>
            </div>

            {role === 'school' ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">School Name</label>
                  <input
                    type="text"
                    placeholder="e.g. STEM Explorers Academy"
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Contact Educator Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ms. Emily Davis"
                      value={schoolData.contactName}
                      onChange={(e) => setSchoolData({ ...schoolData, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Educator Email</label>
                    <input
                      type="email"
                      placeholder="admin@stemexplorers.edu"
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 234-5678"
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Create Educator Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={schoolData.password}
                      onChange={(e) => setSchoolData({ ...schoolData, password: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Johnson"
                    value={familyData.parentName}
                    onChange={(e) => setFamilyData({ ...familyData, parentName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Parent Email</label>
                    <input
                      type="email"
                      placeholder="parent@family.com"
                      value={familyData.email}
                      onChange={(e) => setFamilyData({ ...familyData, email: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Create Parent Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={familyData.password}
                      onChange={(e) => setFamilyData({ ...familyData, password: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: INITIAL ACCOUNT & WORLD SETUP */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                  {role === 'school' ? 'Student Roster & Class Setup' : 'Children Account Setup'}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  {role === 'school'
                    ? 'Add students, assign avatars, auto-generate 8-digit access codes, and pick starting worlds.'
                    : 'Add one or more children, assign character avatars, generate 8-digit access codes, and choose starting worlds.'}
                </p>
              </div>

              <button
                type="button"
                onClick={addChild}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-normal rounded-xl text-xs border border-amber-500 shadow-xs flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
              >
                <IconPlus className="w-4 h-4" />
                <span>{role === 'school' ? 'Add Student' : 'Add Child'}</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {childrenList.map((child, idx) => (
                <div key={child.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      {role === 'school' ? `Student #${idx + 1}` : `Child #${idx + 1}`}
                    </span>
                    {childrenList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(child.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-normal flex items-center space-x-1 cursor-pointer"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                      {role === 'school' ? 'Student Name' : 'Child Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={role === 'school' ? `e.g. Student ${idx + 1}` : `e.g. Child ${idx + 1}`}
                      value={child.name}
                      onChange={(e) => updateChild(child.id, { name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Character Avatar Picker */}
                  <div>
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1.5">
                      Pick Character Avatar
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {AVATAR_OPTIONS.map((avatarPath) => (
                        <button
                          key={avatarPath}
                          type="button"
                          onClick={() => updateChild(child.id, { avatar: avatarPath })}
                          className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition ${
                            child.avatar === avatarPath ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent opacity-70'
                          }`}
                        >
                          <Image src={avatarPath} alt="Avatar" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-normal text-slate-500 uppercase">8-Digit Access Code</label>
                        <button
                          type="button"
                          onClick={() => updateChild(child.id, { studentCode: generate8DigitCode() })}
                          className="text-[10px] text-amber-700 font-normal flex items-center space-x-1 cursor-pointer"
                        >
                          <IconRefresh className="w-3 h-3" />
                          <span>Refresh</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={8}
                        value={child.studentCode}
                        onChange={(e) => updateChild(child.id, { studentCode: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono text-amber-950 tracking-widest outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Assigned World</label>
                      <select
                        value={child.assignedWorldId}
                        onChange={(e) => updateChild(child.id, { assignedWorldId: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-950 font-normal rounded-xl text-xs outline-none"
                      >
                        <option value={1}>World 1 (Scratch)</option>
                        <option value={2}>World 2 (HTML)</option>
                        <option value={3}>World 3 (CSS)</option>
                        <option value={4}>World 4 (JS)</option>
                        <option value={5}>World 5 (Python)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: ONBOARDING COMPLETE */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <IconSparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-medium text-slate-900 tracking-tight">You're All Set!</h2>
              <p className="text-xs text-slate-500 font-normal mt-1 max-w-md mx-auto">
                Your {role === 'school' ? 'school educator' : 'family parent'} profile and {childrenList.length} {role === 'school' ? 'student' : 'child'} account(s) have been configured.
              </p>
            </div>

            {/* Portal Login Credentials Box */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl max-w-lg w-full text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-amber-800 font-medium tracking-wider">Your Portal Credentials</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-md font-medium">Use for Login</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <p className="text-[10px] text-amber-700 uppercase">Login Email</p>
                  <p className="font-mono text-slate-900 font-medium truncate">{role === 'school' ? schoolData.email : familyData.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-700 uppercase">Password</p>
                  <p className="font-mono text-slate-900 font-medium">{role === 'school' ? schoolData.password : familyData.password}</p>
                </div>
              </div>
            </div>

            {/* Access Code Cards List */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-lg w-full flex flex-col gap-3 text-left max-h-[220px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-normal tracking-wider">
                  Configured Accounts ({childrenList.length})
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-medium">Ready</span>
              </div>

              {childrenList.map((c) => (
                <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 relative overflow-hidden border border-slate-200">
                        <Image src={c.avatar} alt="Avatar" fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-slate-900">{c.name || 'Child Account'}</h4>
                        <p className="text-[10px] text-slate-500">World {c.assignedWorldId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-medium text-amber-950 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 tracking-wider">
                        {c.studentCode}
                      </span>
                      <button
                        onClick={() => copyCode(c.id, c.studentCode)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-normal border border-slate-200"
                        title="Copy Code"
                      >
                        {copiedCodeId === c.id ? <IconCheck className="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full max-w-md py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium rounded-xl text-xs border border-amber-500 shadow-md transition-all scale-105"
            >
              Go to {role === 'school' ? 'Schools Portal' : 'Families Portal'} →
            </button>
          </div>
        )}

        {/* Wizard Controls Footer */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-slate-150 pt-4 mt-2">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-xl text-xs font-normal flex items-center space-x-1.5 transition"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium rounded-xl text-xs border border-amber-500 shadow-sm flex items-center space-x-1.5 transition"
            >
              <span>Next Step</span>
              <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <footer className="text-center text-[10px] text-slate-400 font-normal uppercase tracking-wider py-2">
        © 2026 PuzzlePro Onboarding Wizard. All rights reserved.
      </footer>

      {/* EMAIL VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <IconX className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <IconMailCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Verify Email Address</h3>
                <p className="text-xs text-slate-500">
                  Code sent to <span className="font-medium text-slate-800">{role === 'school' ? schoolData.email : familyData.email}</span>
                </p>
              </div>
            </div>

            {verificationMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 mb-4 ${
                verificationMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {verificationMsg.type === 'success' ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconAlertCircle className="w-4 h-4 shrink-0" />}
                <span>{verificationMsg.text}</span>
              </div>
            )}

            {demoCodeHint && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800 mb-4 flex items-center justify-between">
                <span>Verification OTP Code:</span>
                <span className="font-mono font-bold text-sky-900 tracking-wider text-xs">{demoCodeHint}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Enter 6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 482910"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyCodeSubmit}
                  disabled={isVerifyingCode}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl text-xs border border-amber-500 shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  {isVerifyingCode ? <span>Verifying...</span> : <span>Verify & Continue</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
