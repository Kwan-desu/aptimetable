import React from 'react';
import { Settings, RefreshCw, Calendar, SearchCheck, Compass } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onRefresh,
  loading,
  colorPalette,
  selectedIntake,
  onOpenIntakeModal
}) {
  const paletteNames = {
    indigo: 'Indigo',
    emerald: 'Emerald',
    rose: 'Rose',
    amber: 'Amber',
    violet: 'Violet'
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--md-sys-color-surface)]/90 transition-colors border-b border-[var(--md-sys-color-surface-container-high)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Logo, App Title, Intake Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm"
            aria-hidden="true"
          >
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-none">
                APTimetable
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                Web
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] mt-0.5">
              Material You • {paletteNames[colorPalette] || 'Theme'}
            </p>
          </div>

          {/* Quick Intake Badge Button in Header */}
          <button
            type="button"
            onClick={onOpenIntakeModal}
            title="Click to switch Course Intake Code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-xs font-bold transition cursor-pointer border border-[var(--md-sys-color-outline-variant)]/30 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
            <span className="max-w-[130px] sm:max-w-none truncate">
              {selectedIntake || 'Select Intake'}
            </span>
          </button>
        </div>

        {/* Center Section: Desktop Segmented Tab Switcher */}
        <nav
          className="hidden md:inline-flex p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20"
          aria-label="Main Navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              activeTab === 'timetable'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Student Timetable</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              activeTab === 'classroom'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <SearchCheck className="w-4 h-4" aria-hidden="true" />
            <span>Classroom Finder</span>
          </button>
        </nav>

        {/* Right Section: Actions (Refresh, Theme Settings, GitHub) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Force Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh timetable data"
            title="Refresh Live Data"
            className="p-2.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[var(--md-sys-color-primary)]' : ''}`} aria-hidden="true" />
          </button>

          {/* Settings / Appearance Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open Appearance & Settings"
            title="Appearance & Settings"
            className="p-2.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* GitHub Repository Link Button */}
          <a
            href="https://github.com/Kwan-desu/aptimetable"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source code on GitHub"
            title="GitHub Repository (Kwan-desu/aptimetable)"
            className="p-2.5 rounded-xl hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
