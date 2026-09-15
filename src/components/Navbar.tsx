import React, { useState } from 'react';
import {
  FileText,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Menu,
  X,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenSearch?: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenSettings,
  onNavigate,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                PDF <span className="text-indigo-600 dark:text-indigo-400">Tools</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-1">
                Fast & Secure
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('hero')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSection === 'hero'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-tools"
              onClick={() => handleNavClick('tools')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSection === 'tools'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              All Tools
            </button>
            <button
              id="nav-link-privacy"
              onClick={() => handleNavClick('privacy')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSection === 'privacy'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Privacy & Security
            </button>
            <button
              id="nav-link-about"
              onClick={() => handleNavClick('about')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeSection === 'about'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              About
            </button>
          </nav>

          {/* Desktop Right Action Area: Theme Toggle & Settings */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              id="settings-btn"
              onClick={onOpenSettings}
              aria-label="Settings and preferences"
              title="Settings"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <button
              id="cta-explore-nav-btn"
              onClick={() => handleNavClick('tools')}
              className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Tools</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-2 transition-all"
        >
          <button
            id="mobile-nav-home"
            onClick={() => handleNavClick('hero')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </button>
          <button
            id="mobile-nav-tools"
            onClick={() => handleNavClick('tools')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            All Tools
          </button>
          <button
            id="mobile-nav-privacy"
            onClick={() => handleNavClick('privacy')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Privacy & Security
          </button>
          <button
            id="mobile-nav-about"
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            About
          </button>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              id="mobile-nav-settings"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 py-1"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
            <button
              id="mobile-cta-explore"
              onClick={() => handleNavClick('tools')}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg"
            >
              Explore Tools
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
