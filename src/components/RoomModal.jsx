import React, { useEffect } from 'react';
import { X, Clock, User, CheckCircle2, DoorOpen, Users } from 'lucide-react';

export default function RoomModal({ room, onClose }) {
  useEffect(() => {
    if (!room) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, onClose]);

  if (!room) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-2xl overflow-hidden focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface-container)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs"
              aria-hidden="true"
            >
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="room-modal-title" className="text-lg font-black text-[var(--md-sys-color-on-surface)]">
                  Room {room.room}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  {room.category}
                </span>
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                Full Day Schedule & Sessions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {room.scheduleToday && room.scheduleToday.length > 0 ? (
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[var(--md-sys-color-primary)] mb-3">
                Occupied Classes Today ({room.scheduleToday.length})
              </div>
              <div className="space-y-2.5">
                {room.scheduleToday.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--md-sys-color-primary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{item.TIME_FROM} – {item.TIME_TO}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                        {item.INTAKE}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                      {item.MODULE_NAME}
                    </h4>

                    <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)]" aria-hidden="true" />
                        <span>{item.NAME || item.LECTID || 'Lecturer'}</span>
                      </span>
                      {item.GROUPING && (
                        <span className="flex items-center gap-1 text-[11px] text-[var(--md-sys-color-outline)]">
                          <Users className="w-3 h-3" aria-hidden="true" />
                          <span>Grp {item.GROUPING}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-dashed border-[var(--md-sys-color-outline-variant)]/40 p-6 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" aria-hidden="true" />
              <div className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                Completely Free All Day!
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs mx-auto">
                No classes are booked in Room {room.room} during this entire day.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface-container)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
