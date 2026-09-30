import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import TimetableTab from './components/TimetableTab';
import ClassroomFinderTab from './components/ClassroomFinderTab';
import SettingsModal from './components/SettingsModal';
import { fetchWeeklyTimetable } from './utils/api';
import { AlertCircle, Calendar } from 'lucide-react';

export default function App() {
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' or 'classroom'
  const [intakeModalTrigger, setIntakeModalTrigger] = useState(false);

  // Settings State: themeMode ('system', 'light', 'dark') & colorPalette ('indigo', 'emerald', 'rose', 'amber', 'violet')
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'system';
  });

  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('theme_palette') || 'indigo';
  });

  const [selectedIntake, setSelectedIntake] = useState(() => {
    return localStorage.getItem('last_intake') || '';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme mode (light/dark/system) and palette class to document root
  useEffect(() => {
    const root = document.documentElement;

    // Apply color palette class
    const palettes = ['theme-indigo', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-violet'];
    palettes.forEach((p) => root.classList.remove(p));
    root.classList.add(`theme-${colorPalette}`);
    localStorage.setItem('theme_palette', colorPalette);

    // Apply dark class
    const updateDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDarkMode();
    localStorage.setItem('theme_mode', themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (themeMode === 'system') updateDarkMode();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode, colorPalette]);

  // Load timetable data
  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeeklyTimetable(forceRefresh);
      setAllTimetables(data);
      // Refresh local intake state if saved
      setSelectedIntake(localStorage.getItem('last_intake') || '');
    } catch (err) {
      console.error('Failed to load timetable:', err);
      setError('Unable to fetch timetable data. Please check your connection or try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenIntakeModal = () => {
    setActiveTab('timetable');
    setIntakeModalTrigger(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] transition-colors duration-200">
      {/* Web Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => loadData(true)}
        loading={loading}
        colorPalette={colorPalette}
        selectedIntake={selectedIntake}
        onOpenIntakeModal={handleOpenIntakeModal}
      />

      {/* Main Web Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Mobile Navigation Bar (visible only on small viewports) */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Error notification banner */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 text-xs font-bold"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadData(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading overlay / skeleton indicator */}
        {loading && allTimetables.length === 0 ? (
          <div className="py-28 text-center space-y-4">
            <div
              className="w-12 h-12 mx-auto rounded-full border-3 border-[var(--md-sys-color-primary-container)] border-t-[var(--md-sys-color-primary)] animate-spin"
              aria-label="Loading campus timetable feed"
            />
            <p className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)]">
              Connecting to campus timetable S3 feed...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'timetable' ? (
              <TimetableTab
                allTimetables={allTimetables}
                loading={loading}
                intakeModalTrigger={intakeModalTrigger}
                onIntakeModalTriggerConsumed={() => setIntakeModalTrigger(false)}
              />
            ) : (
              <ClassroomFinderTab allTimetables={allTimetables} loading={loading} />
            )}
          </div>
        )}
      </main>

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setSelectedIntake(localStorage.getItem('last_intake') || '');
        }}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        colorPalette={colorPalette}
        setColorPalette={setColorPalette}
        selectedIntake={selectedIntake}
        onOpenIntakeDialog={handleOpenIntakeModal}
        onRefresh={() => loadData(true)}
        loading={loading}
      />

      {/* Web Footer */}
      <footer className="mt-12 py-6 border-t border-[var(--md-sys-color-surface-container-high)] text-center text-xs text-[var(--md-sys-color-outline)] space-y-1">
        <p className="font-semibold text-[var(--md-sys-color-on-surface)]">
          APTimetable Web App
        </p>
        <p className="text-[11px]">
          Material You Design System • Zero Emoji Vector Icons • Accessible WCAG 2.1 Compliant
        </p>
        <p className="pt-1">
          <a
            href="https://github.com/Kwan-desu/aptimetable"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-bold text-[var(--md-sys-color-primary)]"
          >
            GitHub Repository (Open Source)
          </a>
        </p>
      </footer>
    </div>
  );
}
