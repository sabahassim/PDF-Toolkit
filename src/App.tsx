import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PopularTools } from './components/PopularTools';
import { PrivacySection } from './components/PrivacySection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ToolPage } from './components/ToolPage';
import { SettingsModal } from './components/SettingsModal';
import { PolicyModal } from './components/PolicyModal';
import { PdfTool, UserPreferences } from './types';
import { PDF_TOOLS } from './data/tools';

export default function App() {
  // Theme state with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pdftools_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return {
      theme: darkMode ? 'dark' : 'light',
      autoDownload: true,
      highQualityPreview: true,
      privacyStrict: true,
    };
  });

  // Workspace, Settings, and Policy modal states
  const [selectedTool, setSelectedTool] = useState<PdfTool | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | null>(null);

  // Search query synced between Hero and Tools Grid
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active section for nav highlighting
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Synchronize darkMode with document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pdftools_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pdftools_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      setPreferences((p) => ({ ...p, theme: next ? 'dark' : 'light' }));
      return next;
    });
  };

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      if (updated.theme) {
        if (updated.theme === 'dark') setDarkMode(true);
        else if (updated.theme === 'light') setDarkMode(false);
        else {
          // system
          const prefersDark =
            window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    if (selectedTool) {
      setSelectedTool(null);
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* 1. Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigate={scrollToSection}
        activeSection={activeSection}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {selectedTool ? (
          /* DEDICATED TOOL PAGE VIEW */
          <ToolPage
            tool={selectedTool}
            onBack={() => setSelectedTool(null)}
            darkMode={darkMode}
          />
        ) : (
          /* HOME LANDING VIEW */
          <>
            {/* 2. Hero Section */}
            <Hero
              onExploreClick={() => scrollToSection('tools')}
              onPrivacyClick={() => scrollToSection('privacy')}
              onLaunchMergePdf={() => {
                const mergeTool = PDF_TOOLS.find((t) => t.id === 'merge-pdf');
                if (mergeTool) setSelectedTool(mergeTool);
              }}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                if (q.trim()) {
                  const toolsElem = document.getElementById('tools');
                  if (toolsElem) {
                    toolsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
            />

            {/* 3. Popular Tools Section */}
            <PopularTools
              onSelectTool={(tool) => setSelectedTool(tool)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              darkMode={darkMode}
            />

            {/* 4. Privacy Section */}
            <PrivacySection onLearnMore={() => setPolicyModalType('privacy')} />

            {/* About Section */}
            <AboutSection />
          </>
        )}
      </main>

      {/* 5. Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenPrivacyModal={() => setPolicyModalType('privacy')}
        onOpenTermsModal={() => setPolicyModalType('terms')}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        darkMode={darkMode}
      />

      {/* Policy (Privacy / Terms) Modal */}
      <PolicyModal
        type={policyModalType}
        onClose={() => setPolicyModalType(null)}
      />
    </div>
  );
}
