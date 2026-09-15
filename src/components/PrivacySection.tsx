import React from 'react';
import {
  ShieldCheck,
  Lock,
  Trash2,
  Cpu,
  CheckCircle,
  EyeOff,
  ServerOff,
  FileKey,
} from 'lucide-react';

interface PrivacySectionProps {
  onLearnMore?: () => void;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({ onLearnMore }) => {
  const privacyPillars = [
    {
      icon: ServerOff,
      title: 'Zero Storage Guarantee',
      description:
        'Your documents are strictly loaded for processing and are never stored on any permanent server database or cloud hard drive.',
      badge: 'Zero Retention',
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description:
        'All data transfers utilize TLS 1.3 cryptographic protocols with 256-bit encryption to protect your sensitive materials in transit.',
      badge: '256-bit SSL',
    },
    {
      icon: EyeOff,
      title: 'No Data Mining or AI Scraping',
      description:
        'We never parse, read, inspect, or feed your documents into AI training sets or third-party analytics engines.',
      badge: '100% Private',
    },
    {
      icon: Trash2,
      title: 'Instant Ephemeral Disposal',
      description:
        'Immediate automatic memory clearing ensures zero residual traces remain once your download or session finishes.',
      badge: 'Auto-Purge',
    },
  ];

  return (
    <section
      id="privacy"
      className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Uncompromising Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your documents belong to you alone.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Privacy isn't an afterthought or a setting you have to search for — it is the fundamental
            engineering principle behind PDF Tools. We built our visual workflows and security protocols
            so you never have to worry about leaked confidential records.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                id={`privacy-pillar-${idx}`}
                className="relative flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400/60 dark:hover:border-emerald-600/60 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Enforced Policy</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Trust Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <FileKey className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Independent Client-Side Privacy Standard
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl">
                Unlike older platforms that monetize user data or upload documents to centralized servers,
                PDF Tools prioritizes client-side architecture whenever possible.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-slate-200 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ISO/IEC 27001 Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
