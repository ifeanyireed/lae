'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveOrganisation, saveUser } from '@/services/api';
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
  });

  const [familyData, setFamilyData] = useState({
    parentName: '',
    email: '',
    phone: '',
  });

  // Step 3 Form - First Student / Child
  const [initialAccount, setInitialAccount] = useState({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    studentCode: Math.floor(10000000 + Math.random() * 90000000).toString(),
    className: 'Grade 5 Coding Class',
    assignedWorldId: 1,
  });

  const [copiedCode, setCopiedCode] = useState(false);

  const generate8DigitCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(initialAccount.studentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Step Navigation
  const handleNext = () => {
    if (step === 2) {
      if (role === 'school' && (!schoolData.name || !schoolData.email)) {
        alert('Please fill in school name and educator email.');
        return;
      }
      if (role === 'family' && (!familyData.parentName || !familyData.email)) {
        alert('Please fill in parent name and email.');
        return;
      }
    }
    if (step === 3) {
      if (!initialAccount.name) {
        alert(role === 'school' ? 'Please enter student name.' : 'Please enter child name.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteOnboarding = () => {
    const orgId = `org_${Date.now().toString().slice(-4)}`;
    const name = role === 'school' ? (schoolData.name || 'New School Academy') : (familyData.parentName || 'Happy Family Account');
    const email = role === 'school' ? schoolData.email : familyData.email;
    const phone = role === 'school' ? schoolData.phone : familyData.phone;
    const domain = role === 'school' ? schoolData.domain : '';

    saveOrganisation({
      id: orgId,
      name: name,
      domain: domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactEmail: email || 'contact@puzzlepro.ng',
      contactPhone: phone || '+1 (555) 000-0000',
      token: `TOKEN_${name.substring(0, Math.min(4, name.length)).toUpperCase()}_9901`,
      groups: role === 'school' ? [initialAccount.className || 'Grade 5 Coding Class'] : ['Kids Group'],
    });

    saveUser({
      name: initialAccount.name || (role === 'school' ? 'First Student' : 'Child Account'),
      avatar: initialAccount.avatar,
      studentCode: initialAccount.studentCode,
      role: 'student',
      organisationId: orgId,
      groupName: role === 'school' ? (initialAccount.className || 'Grade 5 Coding Class') : 'Kids Group',
      assignedWorldId: initialAccount.assignedWorldId,
    });

    if (role === 'school') {
      localStorage.setItem('puzzlepro_school_session', 'authenticated');
      router.push('/schools');
    } else {
      localStorage.setItem('puzzlepro_family_session', 'authenticated');
      router.push('/families');
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
                    <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 987-6543"
                      value={familyData.phone}
                      onChange={(e) => setFamilyData({ ...familyData, phone: e.target.value })}
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
            <div>
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                {role === 'school' ? 'First Student & Class Setup' : 'Child Account Setup'}
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1">
                {role === 'school'
                  ? 'Add your first student to generate an 8-digit access code and assign a Learning World.'
                  : 'Add your child account to generate their 8-digit access code and select their starting world.'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">
                  {role === 'school' ? 'Student Name' : 'Child Name'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'school' ? 'e.g. Alex Johnson' : 'e.g. Leo Johnson'}
                  value={initialAccount.name}
                  onChange={(e) => setInitialAccount({ ...initialAccount, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Character Avatar Picker */}
              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1.5">
                  Pick Character Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {AVATAR_OPTIONS.map((avatarPath) => (
                    <button
                      key={avatarPath}
                      type="button"
                      onClick={() => setInitialAccount({ ...initialAccount, avatar: avatarPath })}
                      className={`w-9 h-9 rounded-full relative shrink-0 overflow-hidden border-2 transition ${
                        initialAccount.avatar === avatarPath ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent opacity-70'
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
                    onClick={() => setInitialAccount({ ...initialAccount, studentCode: generate8DigitCode() })}
                    className="text-[10px] text-amber-700 font-normal flex items-center space-x-1 cursor-pointer"
                  >
                    <IconRefresh className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  value={initialAccount.studentCode}
                  onChange={(e) => setInitialAccount({ ...initialAccount, studentCode: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono text-amber-950 tracking-widest outline-none"
                />
              </div>

              {role === 'school' && (
                <div>
                  <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Class / Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 5 Coding Class"
                    value={initialAccount.className}
                    onChange={(e) => setInitialAccount({ ...initialAccount, className: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-normal text-slate-500 uppercase mb-1">Assigned Learning World</label>
                <select
                  value={initialAccount.assignedWorldId}
                  onChange={(e) => setInitialAccount({ ...initialAccount, assignedWorldId: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 text-amber-950 font-normal rounded-xl text-xs outline-none"
                >
                  <option value={1}>World 1 (Monkey Explorers - Scratch Blocks)</option>
                  <option value={2}>World 2 (HTML Architects - Web Structure)</option>
                  <option value={3}>World 3 (CSS Stylists - Web Design)</option>
                  <option value={4}>World 4 (JS Logic Wizards - Interactivity)</option>
                  <option value={5}>World 5 (Python Masters - Algorithms)</option>
                </select>
              </div>
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
                Your {role === 'school' ? 'school educator' : 'family parent'} profile has been configured successfully.
              </p>
            </div>

            {/* Access Code Card */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl max-w-md w-full flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-normal tracking-wider">
                  Initial Account Details
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-medium">Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 relative overflow-hidden border border-slate-300">
                  <Image src={initialAccount.avatar} alt="Avatar" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900">{initialAccount.name || 'Student Account'}</h4>
                  <p className="text-[11px] text-slate-500">{role === 'school' ? initialAccount.className : 'Child Account'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50 border border-amber-300 p-2.5 rounded-xl mt-1">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-amber-700 font-normal">8-Digit Student Code</span>
                  <span className="font-mono text-sm font-medium text-amber-950 tracking-widest">{initialAccount.studentCode}</span>
                </div>
                <button
                  onClick={copyCode}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-normal flex items-center space-x-1 shadow-xs hover:bg-amber-100 transition"
                >
                  {copiedCode ? <IconCheck className="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
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
    </div>
  );
}
