import React from 'react';
import { Sparkles, Layers, ShieldCheck, HeartHandshake, Zap, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission text */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About The Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Crafted for modern workflows, with zero clutter.
            </h2>

            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              PDF Tools was conceived to solve a frustrating reality of the modern web: basic document
              manipulation tools have become cluttered with predatory advertising, expensive monthly subscriptions,
              forced account creation, and questionable privacy policies.
            </p>

            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              We are engineering a cleaner, respectful alternative. Our platform focuses on ultra-fast
              responsiveness, intuitive single-purpose tools, and uncompromising document security so
              professionals, educators, students, and businesses can complete their tasks seamlessly.
            </p>

            {/* Value checklist */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Wait Queues</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">No throttled processing speeds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Tracking Pixels</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">No cross-site tracking or sale of telemetry.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Extensible Architecture</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Built to scale to dozens of specialized tools.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Free & Accessible</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Core functionality stays open and freely usable.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Original Branding Card Showcase */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur-md mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-black tracking-tight text-white">
                  Original Design & Modern Architecture
                </h3>

                <p className="mt-3 text-sm text-indigo-100 leading-relaxed">
                  We purposely created an original interface focused on clarity, typographic contrast, and
                  predictable controls rather than mimicking cluttered legacy software.
                </p>

                <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-indigo-200">
                  <span>Frontend Foundation: Version 1.0</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">
                    Production Ready UI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
