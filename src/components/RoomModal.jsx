import React from 'react';
import { X, Clock, BookOpen, User, CheckCircle2 } from 'lucide-react';

export default function RoomModal({ roomData, dayLabel, onClose }) {
  if (!roomData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-high)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">
                Room {roomData.room}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                {roomData.category}
              </span>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Schedule for {dayLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
          {roomData.scheduleToday && roomData.scheduleToday.length > 0 ? (
            <div>
              <div className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-2">
                Occupied Slots Today ({roomData.scheduleToday.length})
              </div>
              <div className="space-y-2">
                {roomData.scheduleToday.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--md-sys-color-primary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.TIME_FROM} – {item.TIME_TO}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                        {item.INTAKE}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                      {item.MODULE_NAME}
                    </div>

                    <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                      <User className="w-3 h-3 text-[var(--md-sys-color-outline)]" />
                      <span>{item.NAME || item.LECTID || 'Lecturer'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--md-sys-color-surface)] border border-dashed border-[var(--md-sys-color-outline-variant)]/40">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <div className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                Completely Free All Day!
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                No classes are scheduled in Room {roomData.room} on {dayLabel}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-high)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-95 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
