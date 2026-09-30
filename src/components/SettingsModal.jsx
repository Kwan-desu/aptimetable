import React from 'react';
import { X, Sun, Moon, Laptop, Palette, RefreshCw, CheckCircle2, School } from 'lucide-react';

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
  if (!isOpen) return null;

  const palettes = [
    { key: 'indigo', name: '🔵 Indigo Material', desc: 'Deep Blue & Lavender tones' },
    { key: 'emerald', name: '🟢 Emerald Botanical', desc: 'Nature Green & Mint tones' },
    { key: 'rose', name: '🌸 Rose Material', desc: 'Warm Rose & Coral tones' },
    { key: 'amber', name: '🟠 Amber Sunset', desc: 'Golden Amber & Warm Ochre' },
    { key: 'violet', name: '🟣 Violet Lavender', desc: 'Deep Violet & Lilac tones' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--md-sys-color-surface-container-high)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-[var(--md-sys-color-on-surface)]">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* SECTION 1: APPEARANCE (LIGHT / DARK) */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)]">
              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: MATERIAL YOU COLOR PALETTES */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Material You Color Palette
            </label>
            <div className="space-y-2">
              {palettes.map((p) => {
                const isSelected = colorPalette === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setColorPalette(p.key)}
                    className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/20 hover:border-[var(--md-sys-color-primary)]/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[11px] opacity-75">{p.desc}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: INTAKE & FEED */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Intake Code & Campus Feed
            </label>
            <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[var(--md-sys-color-outline)]">Saved Intake</div>
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--md-sys-color-outline-variant)]/50 hover:bg-[var(--md-sys-color-surface-container-high)] transition cursor-pointer"
                >
                  Change
                </button>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Force Refresh Timetable Feed'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: ABOUT */}
          <div className="pt-2 text-center text-xs text-[var(--md-sys-color-outline)] space-y-0.5">
            <p className="font-bold">APTimetable Web</p>
            <p className="text-[11px]">Google Material You Design • Live Campus S3 Feed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
