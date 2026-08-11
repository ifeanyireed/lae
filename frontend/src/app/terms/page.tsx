import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { FileText, Mail, Phone, MapPin, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions - PuzzlePro',
  description: 'PuzzlePro Terms and Conditions detailing user accounts, subscription rules, content rights, acceptable use, and governing law.',
};

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'accounts', title: '2. User Accounts & Registration' },
    { id: 'subscriptions', title: '3. Subscriptions & Payment Terms' },
    { id: 'intellectual-property', title: '4. Intellectual Property Rights' },
    { id: 'acceptable-use', title: '5. Acceptable Code of Conduct' },
    { id: 'child-safety', title: '6. Child Safety & Educational Use' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'termination', title: '8. Termination of Service' },
    { id: 'governing-law', title: '9. Governing Law & Dispute Resolution' },
    { id: 'contact', title: '10. Contact Information' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-y-auto w-screen select-text">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* HERO BANNER */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-varela tracking-tight text-slate-900">
            Terms & Conditions
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto">
            Last Updated: August 2026 • Please read these terms carefully before using the PuzzlePro platform.
          </p>
        </section>

        {/* MAIN LAYOUT WITH TABLE OF CONTENTS AND CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STICKY TABLE OF CONTENTS (4 COLS) */}
          <div className="lg:col-span-4 hidden lg:block sticky top-24 space-y-4">
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 font-varela flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Table of Contents</span>
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
            
            <section id="acceptance" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                Welcome to <strong>PuzzlePro</strong> (operated by <strong>ResultsPro</strong>). By accessing or using our websites, game applications, school portals, or parent dashboards, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, you may not access or use the platform.
              </p>
            </section>

            <section id="accounts" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                2. User Accounts & Registration
              </h2>
              <p>
                Accounts on PuzzlePro are categorized into Organization/School Accounts, Parent/Family Accounts, and Student Accounts:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>Educators & Organizations:</strong> School administrators warrant that they have authorization to register students for educational purposes.</li>
                <li><strong>Parents & Guardians:</strong> Parents registering child accounts confirm they hold legal guardianship and consent to their child’s participation.</li>
                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your access codes and credentials.</li>
              </ul>
            </section>

            <section id="subscriptions" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                3. Subscriptions & Payment Terms
              </h2>
              <p>
                PuzzlePro offers tier-based subscriptions for individuals, families, and educational institutions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Subscription limits (such as student roster caps and active world access) are centrally managed and enforced via <code>SubscriptionService</code>.</li>
                <li>Subscription fees are billed in advance on a recurring monthly or annual basis unless cancelled prior to renewal.</li>
                <li>Refunds are processed in accordance with our billing policy or at the discretion of ResultsPro customer support.</li>
              </ul>
            </section>

            <section id="intellectual-property" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                4. Intellectual Property Rights
              </h2>
              <p>
                All 636 coding exercises, graphics, interactive canvases, artwork, audio effects, game engine software, logos, and curriculum materials are the exclusive property of ResultsPro. Users are granted a non-transferable, limited license to access content strictly for personal or classroom learning.
              </p>
            </section>

            <section id="acceptable-use" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                5. Acceptable Code of Conduct
              </h2>
              <p>
                Users agree not to engage in any activity that compromises the security or integrity of PuzzlePro:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Attempting to reverse engineer, decompile, or extract the platform source code or API endpoints.</li>
                <li>Bypassing access controls, subscription limits, or security filters.</li>
                <li>Submitting inappropriate content, offensive usernames, or harmful code scripts.</li>
              </ul>
            </section>

            <section id="child-safety" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                6. Child Safety & Educational Use
              </h2>
              <p>
                PuzzlePro is designed specifically for children. We adhere strictly to COPPA guidelines. We do not display targeted third-party advertising to student accounts, and all interactive features are supervised by authorized school or family administrators.
              </p>
            </section>

            <section id="liability" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                7. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, ResultsPro shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, server interruptions, or data loss.
              </p>
            </section>

            <section id="termination" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                8. Termination of Service
              </h2>
              <p>
                ResultsPro reserves the right to suspend or terminate accounts that violate these Terms & Conditions or engage in fraudulent activities, without prior notice.
              </p>
            </section>

            <section id="governing-law" className="space-y-3">
              <h2 className="text-xl font-bold font-varela text-slate-900 border-b border-slate-200 pb-2">
                9. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Lagos State, Nigeria.
              </p>
            </section>

            <section id="contact" className="space-y-4 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-bold font-varela text-slate-900">
                10. Contact Information
              </h2>
              <p>
                For any legal inquiries, clarification on these Terms, or support requests, please contact ResultsPro:
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span><strong>Address:</strong> House 5, B Close, 206 Road, Festac Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span><strong>Phone:</strong> 08067028859</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-4 h-4 text-amber-600" />
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
