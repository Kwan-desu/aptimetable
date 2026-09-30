import React from 'react';
import { MapPin, User, Clock } from 'lucide-react';
import { getClassStatus } from '../utils/api';

// Subject / Module color synchronization with Material You
function getModuleColorTheme(modId = '') {
  let hash = 0;
  for (let i = 0; i < modId.length; i++) {
    hash = (hash << 5) - hash + modId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % 4;
  switch (idx) {
    case 0:
      return {
        accent: 'bg-[var(--md-sys-color-primary)]',
        badgeBg: 'bg-[var(--md-sys-color-primary-container)]',
        badgeText: 'text-[var(--md-sys-color-on-primary-container)]',
        timeText: 'text-[var(--md-sys-color-primary)]'
      };
    case 1:
      return {
        accent: 'bg-[var(--md-sys-color-secondary)]',
        badgeBg: 'bg-[var(--md-sys-color-secondary-container)]',
        badgeText: 'text-[var(--md-sys-color-on-secondary-container)]',
        timeText: 'text-[var(--md-sys-color-secondary)]'
      };
    case 2:
      return {
        accent: 'bg-[var(--md-sys-color-tertiary)]',
        badgeBg: 'bg-[var(--md-sys-color-tertiary-container)]',
        badgeText: 'text-[var(--md-sys-color-on-tertiary-container)]',
        timeText: 'text-[var(--md-sys-color-tertiary)]'
      };
    default:
      return {
        accent: 'bg-[var(--md-sys-color-outline)]',
        badgeBg: 'bg-[var(--md-sys-color-surface-container-highest)]',
        badgeText: 'text-[var(--md-sys-color-on-surface)]',
        timeText: 'text-[var(--md-sys-color-on-surface)]'
      };
  }
}

export default function ClassCard({ cls }) {
  const status = getClassStatus(cls); // 'ongoing', 'upcoming', 'past'
  const isOngoing = status === 'ongoing';
  const isPast = status === 'past';
  const modColors = getModuleColorTheme(cls.MODID || cls.MODULE_NAME);

  const containerStyle = isOngoing
    ? 'bg-[var(--md-sys-color-primary-container)]/40 border-[var(--md-sys-color-primary)] shadow-md'
    : isPast
    ? 'bg-[var(--md-sys-color-surface-container-lowest)] border-[var(--md-sys-color-outline-variant)]/20 opacity-80'
    : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]/30 hover:shadow-md';

  return (
    <div className={`relative flex overflow-hidden rounded-2xl border transition-all duration-200 ${containerStyle}`}>
      {/* Left Material You Subject Color Accent Strip */}
      <div className={`w-1.5 shrink-0 ${modColors.accent}`} />

      <div className="flex-1 p-3.5 sm:p-4 space-y-2">
        {/* Line 1: Time range + Module code pill + Live status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${isOngoing ? 'text-[var(--md-sys-color-on-primary-container)]' : modColors.timeText}`}>
              {cls.TIME_FROM} – {cls.TIME_TO}
            </span>

            {cls.MODID && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${modColors.badgeBg} ${modColors.badgeText}`}>
                {cls.MODID}
              </span>
            )}
          </div>

          <div>
            {isOngoing && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                LIVE
              </span>
            )}
            {isPast && (
              <span className="text-[10px] font-medium text-[var(--md-sys-color-outline)]">
                Done
              </span>
            )}
          </div>
        </div>

        {/* Line 2: Module Title */}
        <h3 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] leading-snug line-clamp-2">
          {cls.MODULE_NAME}
        </h3>

        {/* Line 3: Room · Lecturer · Group (Clean inline) */}
        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] flex-wrap pt-0.5">
          <span className="inline-flex items-center gap-1 font-bold text-[var(--md-sys-color-on-surface)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
            {cls.ROOM || 'TBA'}
          </span>

          <span className="text-[var(--md-sys-color-outline)]">·</span>

          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
            <User className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" />
            <span className="truncate">{cls.NAME || cls.LECTID || 'Staff'}</span>
          </span>

          {cls.GROUPING && (
            <>
              <span className="text-[var(--md-sys-color-outline)]">·</span>
              <span className="text-[11px] font-semibold text-[var(--md-sys-color-outline)]">
                Grp {cls.GROUPING}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
