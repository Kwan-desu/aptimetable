import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import TimetableTab from './components/TimetableTab';
import ClassroomFinderTab from './components/ClassroomFinderTab';
import SettingsModal from './components/SettingsModal';
import { fetchWeeklyTimetable } from './utils/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' or 'classroom'

  // Settings State: themeMode ('system', 'light', 'dark') & colorPalette ('indigo', 'emerald', 'rose', 'amber', 'violet')
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'system';
  });

  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('theme_palette') || 'indigo';
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
    } catch (err) {
      console.error('Failed to load timetable:', err);
      setError('Unable to fetch timetable data. Please check your network or try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] transition-colors duration-200">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={() => loadData(true)}
        loading={loading}
        colorPalette={colorPalette}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 sm:py-5 space-y-4">
        {/* Navigation Tabs */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Error notification banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading overlay / skeleton indicator */}
        {loading && allTimetables.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-3 border-[var(--md-sys-color-primary-container)] border-t-[var(--md-sys-color-primary)] animate-spin" />
            <p className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)]">
              Connecting to campus timetable feed...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'timetable' ? (
              <TimetableTab allTimetables={allTimetables} loading={loading} />
            ) : (
              <ClassroomFinderTab allTimetables={allTimetables} loading={loading} />
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        colorPalette={colorPalette}
        setColorPalette={setColorPalette}
        selectedIntake={localStorage.getItem('last_intake') || ''}
        onOpenIntakeDialog={() => {
          // Intake modal can be triggered
        }}
        onRefresh={() => loadData(true)}
        loading={loading}
      />

      {/* Minimal Footer */}
      <footer className="mt-8 py-4 border-t border-[var(--md-sys-color-surface-container-high)] text-center text-[11px] text-[var(--md-sys-color-outline)]">
        <p>APTimetable • Material You • Campus Live Feed</p>
      </footer>
    </div>
  );
}
