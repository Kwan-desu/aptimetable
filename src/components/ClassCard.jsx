import React from 'react';
import { MapPin, User, Clock, Users, BookOpen } from 'lucide-react';
import { getClassStatus } from '../utils/api';

// Subject / Module color synchronization with Material You tokens
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
    ? 'bg-[var(--md-sys-color-primary-container)]/35 border-[var(--md-sys-color-primary)] shadow-sm'
    : isPast
    ? 'bg-[var(--md-sys-color-surface-container-lowest)] border-[var(--md-sys-color-outline-variant)]/25 opacity-75'
    : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]/30 hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-xs';

  return (
    <article
      className={`relative flex overflow-hidden rounded-2xl border transition-all duration-200 ${containerStyle}`}
      aria-label={`${cls.MODULE_NAME || 'Class'}, ${cls.TIME_FROM} to ${cls.TIME_TO}, Room ${cls.ROOM || 'TBA'}`}
    >
      {/* Left Material You Subject Color Accent Strip */}
      <div className={`w-1.5 shrink-0 ${modColors.accent}`} aria-hidden="true" />

      <div className="flex-1 p-4 sm:p-5 space-y-2.5">
        {/* Row 1: Time range + Module code pill + Live status badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                isOngoing ? 'text-[var(--md-sys-color-on-primary-container)]' : modColors.timeText
              }`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{cls.TIME_FROM} – {cls.TIME_TO}</span>
            </span>

            {cls.MODID && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${modColors.badgeBg} ${modColors.badgeText}`}
              >
                {cls.MODID}
              </span>
            )}
          </div>

          <div>
            {isOngoing && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
                LIVE NOW
              </span>
            )}
            {isPast && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-outline)]">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Module Title */}
        <h3 className="text-sm sm:text-base font-black text-[var(--md-sys-color-on-surface)] leading-snug">
          {cls.MODULE_NAME}
        </h3>

        {/* Row 3: Room · Lecturer · Group metadata chips */}
        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] flex-wrap pt-0.5">
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--md-sys-color-on-surface)] px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-high)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" aria-hidden="true" />
            <span>Room {cls.ROOM || 'TBA'}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-high)] truncate max-w-[240px]">
            <User className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" aria-hidden="true" />
            <span className="truncate">{cls.NAME || cls.LECTID || 'Staff'}</span>
          </span>

          {cls.GROUPING && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-outline)]">
              <Users className="w-3 h-3" aria-hidden="true" />
              <span>Grp {cls.GROUPING}</span>
            </span>
          )}

          {cls.CLASS_CODE && (
            <span className="text-[10px] font-mono text-[var(--md-sys-color-outline)] hidden sm:inline">
              ({cls.CLASS_CODE})
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
