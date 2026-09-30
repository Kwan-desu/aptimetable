import React, { useState } from 'react';
import { Coffee, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export default function GapSuggestionCard({ gap }) {
  const [expanded, setExpanded] = useState(false);
  const hours = Math.floor(gap.gapMinutes / 60);
  const mins = gap.gapMinutes % 60;
  const timeText = hours > 0 && mins > 0 ? `${hours}h ${mins}m` : hours > 0 ? `${hours}h` : `${mins}m`;

  const best = gap.suggestions && gap.suggestions.length > 0 ? gap.suggestions[0] : null;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-3 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-tertiary-container)]/40 border border-[var(--md-sys-color-tertiary)]/20 hover:border-[var(--md-sys-color-tertiary)]/40 transition-all cursor-pointer shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-[var(--md-sys-color-on-tertiary-container)]">
              {timeText} free break
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-tertiary-container)]/70">
              {gap.fromTime} → {gap.toTime}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-full text-[var(--md-sys-color-on-tertiary-container)]/70 hover:text-[var(--md-sys-color-on-tertiary-container)]"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Top suggestion visible by default */}
      {best && (
        <div className="mt-2.5 pt-2 border-t border-[var(--md-sys-color-tertiary)]/20 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="font-bold text-[var(--md-sys-color-on-tertiary-container)]">
            Go to {best.room}
          </span>
          <span className="text-[var(--md-sys-color-on-tertiary-container)]/70">
            · {best.label}
          </span>
        </div>
      )}

      {/* Expanded list of nearby classrooms */}
      {expanded && gap.suggestions && gap.suggestions.length > 1 && (
        <div className="mt-2.5 pt-2 border-t border-[var(--md-sys-color-tertiary)]/20 space-y-1.5">
          <p className="text-[11px] font-semibold text-[var(--md-sys-color-on-tertiary-container)]/80">
            More free rooms near {gap.previousRoom}:
          </p>
          {gap.suggestions.slice(1).map((room, idx) => {
            const fH = Math.floor(room.freeMinutes / 60);
            const fM = room.freeMinutes % 60;
            const freeText = fH > 0 ? `${fH}h ${fM > 0 ? `${fM}m` : ''} free` : `${fM}m free`;

            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[var(--md-sys-color-surface-container-highest)]/50"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[var(--md-sys-color-on-surface)]">{room.room}</span>
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    · {room.label}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[var(--md-sys-color-outline)]">
                  {freeText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
