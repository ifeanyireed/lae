import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { 
  Sparkles, 
  Code2, 
  CheckCircle2, 
  Target, 
  Award, 
  Compass, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  BookOpen,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - PuzzlePro | Gamified Coding for Kids',
  description: 'Learn about PuzzlePro by ResultsPro. Empowering children through 636 gamified coding exercises across Scratch Blocks, HTML, CSS, JavaScript, and Python.',
  openGraph: {
    title: 'About Us - PuzzlePro',
    description: 'Empowering children with 636 interactive coding exercises across 5 progressive worlds.',
  },
};

export default function AboutPage() {
  const worlds = [
    {
      num: 1,
      name: 'Monkey Explorers',
      lang: 'Block Coding (Scratch style)',
      color: 'from-amber-500 to-yellow-600',
      icon: '🐵',
      desc: 'Master foundational sequencing, loops, conditionals, variables, and reusable functions with visual movement blocks.',
    },
    {
      num: 2,
      name: 'The Digital Kingdom',
      lang: 'HTML (Build the World)',
      color: 'from-blue-500 to-indigo-600',
      icon: '🏰',
      desc: 'Build web pages from scratch using headings, lists, images, tables, forms, and semantic HTML5 document structures.',
    },
    {
      num: 3,
      name: 'The Kingdom Comes Alive',
      lang: 'CSS (Design the World)',
      color: 'from-purple-500 to-pink-600',
      icon: '🎨',
      desc: 'Design beautiful web pages with CSS colors, typography, box model spacing, Flexbox, Grid, keyframe animations, and themes.',
    },
    {
      num: 4,
      name: 'Bring the Kingdom to Life',
      lang: 'JavaScript (Awaken the World)',
      color: 'from-emerald-500 to-teal-600',
      icon: '⚡',
      desc: 'Program interactive game mechanics, DOM events, conditional rules, loops, arrays, objects, timers, and state management.',
    },
    {
      num: 5,
      name: 'The Master Engineer',
      lang: 'Python (Power the World)',
      color: 'from-orange-500 to-red-600',
      icon: '🚀',
      desc: 'Master backend engineering, data algorithms, file handling, automation, dictionaries, and system integration.',
    },
  ];

  const pillars = [
    {
      title: 'Gamified Learning',
      desc: 'Kids learn by guiding the Explorer Monkey through vibrant interactive maze puzzles with instant visual feedback.',
      icon: Target,
    },
    {
      title: 'Real-World Skills',
      desc: 'Smoothly transitions young learners from block-based visual logic to industry-standard HTML, CSS, JavaScript, and Python.',
      icon: Code2,
    },
    {
      title: 'Classroom & Family Ready',
      desc: 'Equipped with dedicated portals for schools, teachers, parents, and administrative controls with progress tracking.',
      icon: Award,
    },
    {
      title: 'Strict Child Safety',
      desc: '100% COPPA aligned with strict privacy guarantees, ad controls, and encrypted user data protection.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-y-auto w-screen select-text">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* HERO BANNER SECTION */}
        <section className="text-center space-y-6 pt-4 sm:pt-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Empowering the Next Generation of Creators</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-varela tracking-tight leading-tight text-white max-w-4xl mx-auto">
            Building Logical Minds, One Puzzle at a Time.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            PuzzlePro transforms abstract computer science concepts into fun, story-driven puzzle quests. Designed by <strong className="text-amber-400">ResultsPro</strong> for schools, families, and young self-starters.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-glossy-3d btn-glossy-amber px-6 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore Code Studio</span>
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-lg flex items-center space-x-2"
            >
              <Mail className="w-5 h-5 text-amber-400" />
              <span>Contact Our Team</span>
            </Link>
          </div>
        </section>

        {/* METRICS STATS GRID */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-3xl text-center space-y-2 backdrop-blur-md shadow-xl">
            <div className="text-3xl sm:text-4xl font-black font-varela text-amber-400">636</div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Coding Exercises</div>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-3xl text-center space-y-2 backdrop-blur-md shadow-xl">
            <div className="text-3xl sm:text-4xl font-black font-varela text-emerald-400">5</div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Learning Worlds</div>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-3xl text-center space-y-2 backdrop-blur-md shadow-xl">
            <div className="text-3xl sm:text-4xl font-black font-varela text-blue-400">100%</div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kid-Safe & Ad-Controlled</div>
          </div>
          <div className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-3xl text-center space-y-2 backdrop-blur-md shadow-xl">
            <div className="text-3xl sm:text-4xl font-black font-varela text-purple-400">K-12</div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Classroom & Family Ready</div>
          </div>
        </section>

        {/* MISSION & PILLARS SECTION */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black font-varela text-white tracking-tight">
              Why Kids & Educators Love PuzzlePro
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Our curriculum bridges visual block coding with professional software development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4 hover:border-amber-500/40 transition-colors shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-varela text-white">{pillar.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 PROGRESSIVE WORLDS BREAKDOWN */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black font-varela text-white tracking-tight">
              The 5 Progressive Learning Worlds
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              A structured 636-level learning path designed for gradual skill accumulation.
            </p>
          </div>

          <div className="space-y-4">
            {worlds.map((w) => (
              <div
                key={w.num}
                className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition shadow-xl"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                    {w.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        World {w.num}
                      </span>
                      <h3 className="text-lg font-bold text-white font-varela">{w.name}</h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {w.lang}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {w.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OFFICE LOCATION & CONTACT CARD */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-varela">
                HEADQUARTERS & CONTACT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-varela">
                ResultsPro / PuzzlePro Office
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Have questions or want to partner with us for your school or learning center? Visit or reach out to our team directly.
              </p>
            </div>
            <Link
              href="/contact"
              className="btn-glossy-3d btn-glossy-amber px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider shrink-0 shadow-lg flex items-center space-x-2"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-sm">
            <div className="flex items-start space-x-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs uppercase tracking-wider">Address</div>
                <div className="text-slate-300 text-xs mt-1">
                  House 5, B Close, 206 Road, Festac Lagos, Nigeria
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs uppercase tracking-wider">Phone</div>
                <a href="tel:08067028859" className="text-slate-300 text-xs mt-1 hover:text-amber-300 transition block">
                  08067028859
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs uppercase tracking-wider">Email</div>
                <a href="mailto:hello@resultspro.ng" className="text-slate-300 text-xs mt-1 hover:text-amber-300 transition block">
                  hello@resultspro.ng
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
