import React from 'react';
import { Settings, RefreshCw, CalendarDays } from 'lucide-react';

export default function Header({ onOpenSettings, onRefresh, loading, colorPalette }) {
  const paletteNames = {
    indigo: 'Indigo',
    emerald: 'Emerald',
    rose: 'Rose',
    amber: 'Amber',
    violet: 'Violet'
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-opacity-80 transition-colors border-b border-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-none">
              APTimetable
            </h1>
            <p className="text-[10px] font-semibold text-[var(--md-sys-color-primary)] mt-0.5">
              Material You • {paletteNames[colorPalette] || 'Theme'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Data"
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Settings Button (Theme, Light/Dark mode) */}
          <button
            onClick={onOpenSettings}
            title="Settings & Appearance"
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
