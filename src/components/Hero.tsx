import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  FileCheck2,
} from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onPrivacyClick: () => void;
  onLaunchMergePdf?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onPrivacyClick,
  onLaunchMergePdf,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Subtle decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 blur-3xl overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[350px] rounded-full bg-indigo-400/30"></div>
        <div className="absolute top-[-10%] right-[15%] w-[450px] h-[300px] rounded-full bg-blue-400/25"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Large Headline */}
        <h1
          id="hero-main-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]"
        >
          Work with PDF files{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400">
            easily, quickly
          </span>
          , and securely.
        </h1>

        {/* Short Supporting Text */}
        <p
          id="hero-supporting-text"
          className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Everything you need to merge, split, compress, convert, and organize your PDF documents
          in one unified workspace — crafted with strict client-first privacy standards.
        </p>

        {/* Primary Call-to-Action & Secondary Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            id="hero-explore-tools-btn"
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <span>Explore Tools</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            id="hero-privacy-guarantee-btn"
            onClick={onPrivacyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Guarantee</span>
          </button>
        </div>

        {/* Quick Search Tool Filter Bar */}
        <div className="mt-10 max-w-lg mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              id="hero-search-tools-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tools (e.g. Merge, Compress, Word to PDF)..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Security & Experience Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-slate-800/70 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/40">
            <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero File Retention
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Files are strictly processed in private memory and never saved to databases.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/40">
            <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                High-Speed Execution
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Optimized algorithms convert and compress documents in just seconds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/40">
            <div className="p-2 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Registration Needed
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jump right in without paywalls, sign-up forms, or intrusive cookies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};