import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ShieldCheck, Lock, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - PuzzlePro',
  description: 'PuzzlePro Privacy Policy outlining child safety guarantees, COPPA compliance, data protection, and contact details.',
};

export default function PrivacyPage() {
  const sections = [
    { id: 'commitment', title: '1. Commitment to Child Privacy' },
    { id: 'information-collected', title: '2. Information We Collect' },
    { id: 'use-of-information', title: '3. How We Use Information' },
    { id: 'advertising-policy', title: '4. Third-Party Ads & Controls' },
    { id: 'data-security', title: '5. Data Security & Storage' },
    { id: 'parent-rights', title: '6. Parent & Educator Rights' },
    { id: 'cookies', title: '7. Cookies & Session Storage' },
    { id: 'changes', title: '8. Changes to Privacy Policy' },
    { id: 'contact', title: '9. Contact Our Privacy Team' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-y-auto w-screen select-text">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* HERO BANNER */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>COPPA Aligned & Kid-Safe Guaranteed</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-varela tracking-tight text-slate-900">
            Privacy Policy
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto">
            Last Updated: August 2026 • Your privacy and child safety are our highest priority at ResultsPro.
          </p>
        </section>

        {/* MAIN LAYOUT WITH TABLE OF CONTENTS AND CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STICKY TABLE OF CONTENTS (4 COLS) */}
          <div className="lg:col-span-4 hidden lg:block sticky top-24 space-y-4">
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 font-varela flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Privacy Topics</span>
              </h3>
              <nav className="space-y-1 text-xs">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block py-1.5 px-3 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition font-medium"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* DOCUMENT CONTENT (8 COLS) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-3xl space-y-10 text-slate-700 text-sm leading-relaxed shadow-md">
            
            <section id="commitment" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                1. Commitment to Child Privacy
              </h2>
              <p>
                At <strong>PuzzlePro</strong> (operated by <strong>ResultsPro</strong>), we build educational software designed for children, schools, and families. Protecting young learners' personal data is fundamental to everything we do. We comply fully with the Children’s Online Privacy Protection Act (COPPA) and Nigeria Data Protection Regulation (NDPR).
              </p>
            </section>

            <section id="information-collected" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                2. Information We Collect
              </h2>
              <p>
                We limit data collection to the minimum required to provide an engaging and educational experience:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>Student Accounts:</strong> Student nicknames, assigned avatar choices, group IDs, and exercise progress (stars, block solutions, level completions). We do not require real student names or personal emails for children.</li>
                <li><strong>Educator & Parent Accounts:</strong> Name, contact email address, school/family organization name, and optional phone number for administrative billing and session management.</li>
                <li><strong>Technical Telemetry:</strong> Anonymized browser type and device parameters to ensure smooth rendering of the game canvas.</li>
              </ul>
            </section>

            <section id="use-of-information" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                3. How We Use Information
              </h2>
              <p>
                Information collected on PuzzlePro is strictly used to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Save game state, level progress, and unlocked achievements across device sessions.</li>
                <li>Provide classroom analytics to teachers and progress dashboards to parents.</li>
                <li>Enforce subscription limits and administrative account features.</li>
                <li>Ensure platform security and technical stability.</li>
              </ul>
            </section>

            <section id="advertising-policy" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                4. Third-Party Ads & Controls
              </h2>
              <p>
                PuzzlePro does <strong>NOT</strong> display targeted behavioural advertising to students. Optional Google Ads integration is strictly managed via administrator toggles on an organization level, compliant with <code>ads.txt</code> standards and COPPA ad restrictions.
              </p>
            </section>

            <section id="data-security" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                5. Data Security & Storage
              </h2>
              <p>
                We employ industry-standard encryption (TLS/HTTPS) for all data in transit and isolated database microservices for user credentials and progress state. Regular backups and access audits ensure user data remains confidential and secure.
              </p>
            </section>

            <section id="parent-rights" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                6. Parent & Educator Rights
              </h2>
              <p>
                Parents and authorized educators have the absolute right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Review the personal information stored for their child or student.</li>
                <li>Request immediate deletion or modification of student progress data.</li>
                <li>Refuse further collection or maintenance of student credentials.</li>
              </ul>
            </section>

            <section id="cookies" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                7. Cookies & Session Storage
              </h2>
              <p>
                PuzzlePro uses essential local session tokens and functional cookies strictly to maintain user login state and game sound preferences. We do not use cross-site tracking cookies.
              </p>
            </section>

            <section id="changes" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                8. Changes to Privacy Policy
              </h2>
              <p>
                If we make material changes to how we collect or use student information, we will notify registered educators and parents via email and update the notice on our website homepage.
              </p>
            </section>

            <section id="contact" className="space-y-4 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-bold font-varela text-slate-900">
                9. Contact Our Privacy Team
              </h2>
              <p>
                If you have questions or concerns regarding our privacy practices or COPPA compliance, please contact ResultsPro:
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span><strong>Address:</strong> House 5, B Close, 206 Road, Festac Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span><strong>Phone:</strong> 08067028859</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span><strong>Email:</strong> hello@resultspro.ng</span>
                </div>
              </div>
            </section>

          </div>

        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
