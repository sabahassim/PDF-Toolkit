import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { PolicyModal } from './components/PolicyModal';
import { HomePage } from './pages/HomePage';
import { ToolRoutePage } from './pages/ToolRoutePage';
import { UserPreferences } from './types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');

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
          const prefersDark =
            window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigate={scrollToSection}
        activeSection={isHome ? activeSection : ''}
      />

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                darkMode={darkMode}
                onOpenPrivacyModal={() => setPolicyModalType('privacy')}
              />
            }
          />
          <Route path="/:toolId" element={<ToolRoutePage darkMode={darkMode} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer
        onNavigate={scrollToSection}
        onOpenPrivacyModal={() => setPolicyModalType('privacy')}
        onOpenTermsModal={() => setPolicyModalType('terms')}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        darkMode={darkMode}
      />

      <PolicyModal
        type={policyModalType}
        onClose={() => setPolicyModalType(null)}
      />
    </div>
  );
}
