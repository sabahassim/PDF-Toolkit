import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { PopularTools } from '../components/PopularTools';
import { PrivacySection } from '../components/PrivacySection';
import { AboutSection } from '../components/AboutSection';

interface HomePageProps {
  darkMode: boolean;
  onOpenPrivacyModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ darkMode, onOpenPrivacyModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    const timer = window.setTimeout(() => {
      if (scrollTo) {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0 });
      }
    }, 50);
    return () => window.clearTimeout(timer);
  }, [location.key, location.state]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Hero
        onExploreClick={() => scrollToSection('tools')}
        onPrivacyClick={() => scrollToSection('privacy')}
        onLaunchMergePdf={() => navigate('/merge-pdf')}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            scrollToSection('tools');
          }
        }}
      />

      <PopularTools
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={darkMode}
      />

      <PrivacySection onLearnMore={onOpenPrivacyModal} />

      <AboutSection />
    </>
  );
};
