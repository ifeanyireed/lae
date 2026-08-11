'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  IconMenu2, 
  IconX, 
  IconSparkles, 
  IconCode, 
  IconMail, 
  IconBook 
} from '@tabler/icons-react';

export const SiteHeader: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', icon: IconCode },
    { label: 'About Us', href: '/about', icon: IconBook },
    { label: 'Contact', href: '/contact', icon: IconMail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <Image src="/monkey1.svg" alt="PuzzlePro Monkey" width={32} height={32} className="object-contain" priority />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-black font-varela tracking-tight bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-xs">
                  PuzzlePro
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 rounded-full shadow-xs">
                  KIDS CODE
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 -mt-1 tracking-wide">
                by ResultsPro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Call to Action Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/"
              className="btn-glossy-3d btn-glossy-amber px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-md flex items-center space-x-2 border border-amber-300/50"
            >
              <IconSparkles className="w-4 h-4" />
              <span>Start Coding</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <IconX className="w-6 h-6 text-amber-600" /> : <IconMenu2 className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-200 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-2 animate-fade-in-up shadow-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-glossy-3d btn-glossy-amber py-3 text-sm font-black uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
            >
              <IconSparkles className="w-5 h-5" />
              <span>Start Coding Quests</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
