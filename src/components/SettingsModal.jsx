import React, { useEffect } from 'react';
import { X, Sun, Moon, Laptop, Palette, RefreshCw, Check, School, Sliders } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  themeMode,
  setThemeMode,
  colorPalette,
  setColorPalette,
  selectedIntake,
  onOpenIntakeDialog,
  onRefresh,
  loading
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const palettes = [
    {
      key: 'indigo',
      name: 'Indigo Material',
      desc: 'Deep Blue & Lavender tones',
      primaryColor: '#3F51B5',
      secondaryColor: '#E0E5FF'
    },
    {
      key: 'emerald',
      name: 'Emerald Botanical',
      desc: 'Nature Green & Mint tones',
      primaryColor: '#006C4C',
      secondaryColor: '#89F8C7'
    },
    {
      key: 'rose',
      name: 'Rose Material',
      desc: 'Warm Rose & Coral tones',
      primaryColor: '#984061',
      secondaryColor: '#FFD9E2'
    },
    {
      key: 'amber',
      name: 'Amber Sunset',
      desc: 'Golden Amber & Warm Ochre',
      primaryColor: '#8B5000',
      secondaryColor: '#FFDCBE'
    },
    {
      key: 'violet',
      name: 'Violet Lavender',
      desc: 'Deep Violet & Lilac tones',
      primaryColor: '#6C4FA1',
      secondaryColor: '#EBDCFF'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-2xl overflow-hidden focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[var(--md-sys-color-surface-container-high)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs"
              aria-hidden="true"
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-lg font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
                Preferences & Theme
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Customize appearance, theme colors, and campus sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* SECTION 1: APPEARANCE (LIGHT / DARK) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                Color Mode
              </label>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Current: {themeMode === 'system' ? 'System Match' : themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)]">
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  themeMode === 'system'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
                }`}
              >
                <Laptop className="w-4 h-4" aria-hidden="true" />
                <span>System</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  themeMode === 'light'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
                }`}
              >
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  themeMode === 'dark'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
                }`}
              >
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>Dark</span>
              </button>
            </div>
          </section>

          {/* SECTION 2: MATERIAL YOU COLOR PALETTES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                Material You Palette
              </label>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Dynamic Color Harmonization
              </span>
            </div>
            <div className="space-y-2">
              {palettes.map((p) => {
                const isSelected = colorPalette === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setColorPalette(p.key)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] shadow-xs'
                        : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/20 hover:border-[var(--md-sys-color-primary)]/40 hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Geometric Color Swatch (Dual-tone primary & secondary) */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center p-0.5 shadow-xs border border-white/20 shrink-0"
                        style={{ backgroundColor: p.primaryColor }}
                        aria-hidden="true"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.secondaryColor }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-black tracking-tight">{p.name}</div>
                        <div className="text-[11px] opacity-80">{p.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shrink-0 shadow-xs"
                        aria-hidden="true"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: INTAKE & FEED */}
          <section className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Course Intake & Live Sync
            </label>
            <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[var(--md-sys-color-outline)]">Active Saved Intake</div>
                  <div className="text-sm font-black text-[var(--md-sys-color-on-surface)]">
                    {selectedIntake || 'None Selected'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenIntakeDialog();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--md-sys-color-outline-variant)]/50 hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                >
                  Change Intake
                </button>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{loading ? 'Syncing...' : 'Force Refresh Live Data'}</span>
              </button>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
          <span className="font-semibold">APTimetable Web App</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold hover:opacity-90 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
