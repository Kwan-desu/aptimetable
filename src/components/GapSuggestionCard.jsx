import React, { useState } from 'react';
import { Coffee, ChevronDown, ChevronUp, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function GapSuggestionCard({ gap }) {
  const [expanded, setExpanded] = useState(false);
  const hours = Math.floor(gap.gapMinutes / 60);
  const mins = gap.gapMinutes % 60;
  const timeText = hours > 0 && mins > 0 ? `${hours}h ${mins}m` : hours > 0 ? `${hours}h` : `${mins}m`;

  const best = gap.suggestions && gap.suggestions.length > 0 ? gap.suggestions[0] : null;

  return (
    <article
      className="p-4 sm:p-5 rounded-3xl bg-[var(--md-sys-color-tertiary-container)]/30 border border-[var(--md-sys-color-tertiary)]/25 shadow-xs transition-all hover:border-[var(--md-sys-color-tertiary)]/45 focus-within:ring-2 focus-within:ring-[var(--md-sys-color-tertiary)]"
      aria-label={`Study break: ${timeText} between classes`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[var(--md-sys-color-on-tertiary-container)]">
                {timeText} Study Break
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-tertiary)]/15 text-[var(--md-sys-color-on-tertiary-container)]">
                {gap.fromTime} – {gap.toTime}
              </span>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-tertiary-container)]/80 mt-0.5">
              Previous room: <span className="font-bold">{gap.previousRoom}</span>
            </p>
          </div>
        </div>

        {gap.suggestions && gap.suggestions.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide other free rooms' : 'Show more nearby free rooms'}
            className="p-2 rounded-xl text-[var(--md-sys-color-on-tertiary-container)]/80 hover:text-[var(--md-sys-color-on-tertiary-container)] hover:bg-[var(--md-sys-color-tertiary-container)]/50 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-tertiary)]"
          >
            {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* Primary recommendation card */}
      {best && (
        <div className="mt-3 pt-3 border-t border-[var(--md-sys-color-tertiary)]/20 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span className="text-xs font-black text-[var(--md-sys-color-on-tertiary-container)]">
              Nearest Free Room: {best.room}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
              {best.label}
            </span>
          </div>

          <span className="text-[11px] font-medium text-[var(--md-sys-color-on-tertiary-container)]/75">
            {(() => {
              const m = Number(best.freeMinutes) || 0;
              const h = Math.floor(m / 60);
              const rest = m % 60;
              if (h > 0) return `Free for ${h}h ${rest > 0 ? `${rest}m` : ''}`;
              return `Free for ${rest}m`;
            })()}
          </span>
        </div>
      )}

      {/* Expanded list of alternatives */}
      {expanded && gap.suggestions && gap.suggestions.length > 1 && (
        <div className="mt-3 pt-3 border-t border-[var(--md-sys-color-tertiary)]/20 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-tertiary-container)]/80">
            Other Empty Classrooms Nearby:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gap.suggestions.slice(1).map((room, idx) => {
              const m = Number(room.freeMinutes) || 0;
              const fH = Math.floor(m / 60);
              const fM = m % 60;
              const freeText = fH > 0 ? `${fH}h ${fM > 0 ? `${fM}m ` : ''}free` : `${fM}m free`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                    <span className="font-bold text-[var(--md-sys-color-on-surface)]">{room.room}</span>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                      ({room.label})
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--md-sys-color-outline)]">
                    {freeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
