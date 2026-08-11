'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-amber-500/20 text-slate-400 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto select-text">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <Image src="/monkey1.svg" alt="PuzzlePro Monkey" width={28} height={28} className="object-contain" />
              </div>
            </div>
            <span className="text-2xl font-black font-varela bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              PuzzlePro
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            ResultsPro's gamified coding platform for kids. Master 636 exercises across Scratch Blocks, HTML, CSS, JavaScript, and Python through interactive story adventures.
          </p>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Kid-Safe & COPPA Aligned</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 font-varela">
            Explore Platform
          </h3>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Home & Code Studio</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• About PuzzlePro</span>
              </Link>
            </li>
            <li>
              <Link href="/schools" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• School & Classroom Portal</span>
              </Link>
            </li>
            <li>
              <Link href="/families" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Families & Parent Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/onboarding" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Setup Wizard & Registration</span>
              </Link>
            </li>
            <li>
              <Link href="/controls" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Admin Controls</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Governance */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 font-varela">
            Legal & Support
          </h3>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/privacy" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Privacy Policy</span>
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Terms & Conditions</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                <span>• Contact Us & FAQ</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 font-varela">
            Contact Us
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 leading-snug">
                House 5, B Close, 206 Road, Festac Lagos, Nigeria
              </span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="tel:08067028859" className="text-slate-300 hover:text-amber-300 transition">
                08067028859
              </a>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="mailto:hello@resultspro.ng" className="text-slate-300 hover:text-amber-300 transition">
                hello@resultspro.ng
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} ResultsPro / PuzzlePro. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <Link href="/terms" className="hover:text-amber-300 transition">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-amber-300 transition">Privacy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-amber-300 transition">Contact</Link>
        </div>
      </div>
    </footer>
  );
};
