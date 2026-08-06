'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, UserCheck, Database, Sparkles, Check } from 'lucide-react';
import { soundManager } from '@/utils/sound';
import { API_BASE_URL } from '@/utils/api';

interface UserContext {
  id: number;
  username: string;
  role: 'admin' | 'user';
  groupId: number;
  groupName: string;
  avatar: string;
  totalXP: number;
  totalScore: number;
  totalStars: number;
}

interface FallbackAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userContext: UserContext;
  onUpdateUserContext: (updated: UserContext) => void;
}

const AVATARS = [
  { id: '/monkey1.svg', name: 'Explorer Monkey' },
  { id: '/Profile.svg', name: 'Junior Cadet' },
];

export const FallbackAuthModal: React.FC<FallbackAuthModalProps> = ({
  isOpen,
  onClose,
  userContext,
  onUpdateUserContext,
}) => {
  const [username, setUsername] = useState(userContext.username || 'Admin_Explorer');
  const [role, setRole] = useState<'admin' | 'user'>(userContext.role || 'admin');
  const [groupName, setGroupName] = useState(userContext.groupName || 'Jungle Explorers Group A');
  const [avatar, setAvatar] = useState(userContext.avatar || '/monkey1.svg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setIsSubmitting(true);
    setStatusMessage('Syncing with database...');

    const payload = {
      username: username.trim() || 'Admin_Explorer',
      role: role,
      group_name: groupName.trim() || 'Jungle Explorers Group A',
      group_code: groupName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      avatar: avatar,
      xp: userContext.totalXP || 450,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/engine/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data && data.success && data.user) {
        onUpdateUserContext({
          id: data.user.id || userContext.id || 1,
          username: data.user.username || payload.username,
          role: (data.user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
          groupId: data.user.group_id || 1,
          groupName: data.user.group_name || payload.group_name,
          avatar: data.user.avatar || payload.avatar,
          totalXP: data.user.total_xp ?? userContext.totalXP ?? 450,
          totalScore: userContext.totalScore || 1420,
          totalStars: data.user.total_stars ?? userContext.totalStars ?? 3,
        });
        soundManager.playEquip();
        setStatusMessage('Session synced successfully!');
        setTimeout(() => {
          onClose();
        }, 400);
      } else {
        // Fallback local update if backend fails
        onUpdateUserContext({
          ...userContext,
          username: payload.username,
          role: payload.role,
          groupName: payload.group_name,
          avatar: payload.avatar,
        });
        setStatusMessage('Saved to local session mode.');
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch {
      // Local fallback
      onUpdateUserContext({
        ...userContext,
        username: payload.username,
        role: payload.role,
        groupName: payload.group_name,
        avatar: payload.avatar,
      });
      setStatusMessage('Saved to local session (Offline).');
      setTimeout(() => {
        onClose();
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-varela select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#160f0a] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 z-30 shadow-2xl text-amber-100 space-y-6"
        >
          {/* Header & Close Button */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Session Auth Fallback</h2>
                <p className="text-xs text-amber-200/60">Standalone / Direct Database Session</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-amber-950 hover:bg-amber-900 text-amber-300 hover:text-white transition border border-amber-500/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pre-assigned Access Codes Badge List */}
          <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-3 text-xs space-y-1.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block">
              🔑 Pre-assigned Backend Access Codes (8 Digits)
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => { setUsername('Admin_Explorer'); setRole('admin'); }}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 transition cursor-pointer"
              >
                ADMN-2026 (Admin)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('Cadet_Leo'); setRole('user'); }}
                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 transition cursor-pointer"
              >
                KIDS-1001 (Student)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('Cadet_Maya'); setRole('user'); }}
                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 transition cursor-pointer"
              >
                KIDS-1002
              </button>
              <button
                type="button"
                onClick={() => { setUsername('Cadet_Sam'); setRole('user'); }}
                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 transition cursor-pointer"
              >
                KIDS-1003
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs uppercase font-bold text-amber-200/80 mb-1.5">
                Explorer Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin_Explorer"
                className="w-full px-4 py-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            {/* Role Switcher (Admin / Student Explorer) */}
            <div>
              <label className="block text-xs uppercase font-bold text-amber-200/80 mb-1.5">
                Session Role & Permission
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                    role === 'admin'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg'
                      : 'bg-amber-950/60 text-amber-200/70 border-amber-500/30 hover:bg-amber-900/50'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold">Admin Explorer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                    role === 'user'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-lg'
                      : 'bg-amber-950/60 text-amber-200/70 border-amber-500/30 hover:bg-amber-900/50'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold">Student Explorer</span>
                </button>
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-xs uppercase font-bold text-amber-200/80 mb-1.5">
                Classroom / Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Jungle Explorers Group A"
                className="w-full px-4 py-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-white font-bold text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs uppercase font-bold text-amber-200/80 mb-1.5">
                Select Avatar
              </label>
              <div className="flex items-center space-x-3">
                {AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvatar(item.id)}
                    className={`relative p-2 rounded-2xl border-2 transition cursor-pointer flex items-center justify-center ${
                      avatar === item.id
                        ? 'border-amber-400 bg-amber-500/30'
                        : 'border-amber-500/20 bg-amber-950/50 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="w-12 h-12 relative">
                      <Image src={item.id} alt={item.name} fill className="object-contain" />
                    </div>
                    {avatar === item.id && (
                      <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 rounded-full p-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <p className="text-xs text-center text-amber-300 font-mono animate-pulse">
                {statusMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider border-2 border-amber-300 shadow-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Syncing...' : 'Save & Sync Session Database'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
