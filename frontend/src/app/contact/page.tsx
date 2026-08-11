'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown,
  School,
  Users
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      q: 'How do I register a school or classroom for PuzzlePro?',
      a: 'You can visit our School Portal (/schools) or complete the onboarding wizard (/onboarding). Alternatively, call us at +234 803 542 8870 or email hello@resultspro.ng for bulk student licensing and custom school setup.',
    },
    {
      q: 'Is PuzzlePro suitable for complete beginners with no prior coding experience?',
      a: 'Yes! World 1 begins with visual Block Coding requiring zero typing. Kids learn fundamental sequencing, turning, and logic before advancing to HTML, CSS, JavaScript, and Python.',
    },
    {
      q: 'How do parents manage and track child progress?',
      a: 'Parents can log into the Families Portal (/families) to manage child sub-accounts, view star progress across all 636 exercises, and generate access codes.',
    },
    {
      q: 'Is PuzzlePro safe for children and free from external ads?',
      a: 'PuzzlePro is 100% COPPA compliant and kid-safe. Advertising toggles and student permissions are strictly controlled by school and organization administrators.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-y-auto w-screen select-text">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 pt-4 sm:pt-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>We Are Here to Help</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-varela tracking-tight text-slate-900 max-w-3xl mx-auto">
            Get in Touch With PuzzlePro
          </h1>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about school licensing, curriculum integration, or need technical assistance with your family account? Send us a message or contact us directly.
          </p>
        </section>

        {/* MAIN CONTACT GRID: DIRECT INFO & INTERACTIVE FORM */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: DIRECT CONTACT DETAILS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-md">
              <div className="space-y-2 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold font-varela text-slate-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <span>Contact Information</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Reach out to the ResultsPro / PuzzlePro support team.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Office Address</h3>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      House 5, B Close, 206 Road, Festac Lagos, Nigeria
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Phone / WhatsApp</h3>
                    <a href="tel:+2348035428870" className="text-amber-600 font-semibold text-xs sm:text-sm mt-1 hover:underline block">
                      +234 803 542 8870
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Email Address</h3>
                    <a href="mailto:hello@resultspro.ng" className="text-amber-600 font-semibold text-xs sm:text-sm mt-1 hover:underline block">
                      hello@resultspro.ng
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Support Hours</h3>
                    <p className="text-slate-600 text-xs mt-1">
                      Monday – Friday (8:00 AM – 6:00 PM WAT)
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* QUICK LINK PORTALS CARD */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold font-varela text-slate-900 uppercase tracking-wider">
                Looking for Portal Access?
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link
                  href="/schools"
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition font-medium"
                >
                  <School className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>School Portal</span>
                </Link>
                <Link
                  href="/families"
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 flex items-center space-x-2 transition font-medium"
                >
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Family Portal</span>
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT: INTERACTIVE CONTACT FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-3xl shadow-md space-y-6">
            
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold font-varela text-slate-900">Send Us a Message</h2>
              <p className="text-xs text-slate-500">
                Fill in your details below and our team will get back to you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-varela text-slate-900">Message Sent Successfully!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Thank you for contacting PuzzlePro! A representative will review your message and reply to <strong className="text-amber-600">{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', category: 'General Inquiry', message: '' });
                  }}
                  className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition border border-slate-300"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="School Partnership & Licensing">School Partnership & Licensing</option>
                    <option value="Family Account & Progress Support">Family Account & Progress Support</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Johnson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 803 542 8870"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-glossy-3d btn-glossy-amber py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 border border-amber-400"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Submit Message'}</span>
                </button>

              </form>
            )}

          </div>

        </section>

        {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <section className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-varela text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left font-bold font-varela text-slate-900 text-base flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
