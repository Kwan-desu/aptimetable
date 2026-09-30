import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  DoorOpen,
  CalendarDays,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { findAvailableClassrooms } from '../utils/classroom';
import RoomModal from './RoomModal';

const SCHOOL_DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' }
];

export default function ClassroomFinderTab({ allTimetables, loading }) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const current = days[new Date().getDay()];
    return current === 'SUN' || current === 'SAT' ? 'MON' : current;
  });

  const [fromTime, setFromTime] = useState(() => {
    const now = new Date();
    const hh = ('0' + now.getHours()).slice(-2);
    const mm = ('0' + now.getMinutes()).slice(-2);
    return `${hh}:${mm}`;
  });

  const [toTime, setToTime] = useState(() => {
    const now = new Date();
    const hh = ('0' + Math.min(23, now.getHours() + 1)).slice(-2);
    const mm = ('0' + now.getMinutes()).slice(-2);
    return `${hh}:${mm}`;
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('longest_free');
  const [inspectingRoom, setInspectingRoom] = useState(null);

  const applyPreset = (preset) => {
    const now = new Date();
    if (preset === 'now') {
      const hh = ('0' + now.getHours()).slice(-2);
      const mm = ('0' + now.getMinutes()).slice(-2);
      const nextHh = ('0' + Math.min(23, now.getHours() + 1)).slice(-2);
      setFromTime(`${hh}:${mm}`);
      setToTime(`${nextHh}:${mm}`);
    } else if (preset === 'morning') {
      setFromTime('08:30');
      setToTime('12:30');
    } else if (preset === 'afternoon') {
      setFromTime('13:30');
      setToTime('17:30');
    } else if (preset === 'fullday') {
      setFromTime('08:30');
      setToTime('18:30');
    }
  };

  const availableRooms = useMemo(() => {
    return findAvailableClassrooms(
      allTimetables,
      selectedDay,
      fromTime,
      toTime,
      selectedCategory,
      searchQuery,
      sortBy
    );
  }, [allTimetables, selectedDay, fromTime, toTime, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-5">
      {/* WEB FILTER & CONTROL PANEL */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-4">
        {/* Row 1: Day Selector (Mon-Fri) + Category Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 5-Day School Week Grid */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--md-sys-color-outline)] px-2.5 hidden sm:inline">
              Day:
            </span>
            {SCHOOL_DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  selectedDay === d.key
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {d.key}
              </button>
            ))}
          </div>

          {/* Room Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] overflow-x-auto">
            {[
              { id: 'all', label: 'All Spaces' },
              { id: 'classroom', label: 'Classrooms' },
              { id: 'laboratory', label: 'Computer Labs' },
              { id: 'auditorium', label: 'Auditoriums' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-xs font-black'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Time Window, Presets, Search & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/20">
          {/* Time Picker & Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                aria-label="From time"
                className="w-full p-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
              />
              <span className="text-xs text-[var(--md-sys-color-outline)] font-semibold">to</span>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                aria-label="To time"
                className="w-full p-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'now', label: 'Now' },
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' },
                { id: 'fullday', label: 'Full Day' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="py-1 px-2 rounded-lg text-[11px] font-bold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Name Live Search */}
          <div className="flex items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--md-sys-color-outline)]" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room code (e.g. B-05-02, Aud 1)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)]"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30">
              <ArrowUpDown className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[var(--md-sys-color-on-surface)] focus:outline-none cursor-pointer"
              >
                <option value="longest_free">Longest Free Duration</option>
                <option value="room_asc">Room Name (A → Z)</option>
                <option value="category">Category (Classroom / Lab)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS STATS BANNER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <h3 className="text-sm font-black text-[var(--md-sys-color-on-surface)]">
            {availableRooms.length} Empty Classrooms Found
          </h3>
          <span className="text-xs text-[var(--md-sys-color-outline)]">
            ({selectedDay}, {fromTime} – {toTime})
          </span>
        </div>
      </div>

      {/* ROOMS RESPONSIVE GRID (DESKTOP MULTI-COLUMN) */}
      {availableRooms.length === 0 ? (
        <section className="py-24 text-center space-y-3 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-8">
          <DoorOpen className="w-12 h-12 mx-auto text-[var(--md-sys-color-outline)]" aria-hidden="true" />
          <h4 className="text-base font-black text-[var(--md-sys-color-on-surface)]">
            No Empty Classrooms Found
          </h4>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mx-auto">
            All rooms match the current search criteria are occupied during this time window. Try widening your time range or switching day.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Available Classrooms">
          {availableRooms.map((room) => {
            const freeHours = Math.floor(room.freeDurationMinutes / 60);
            const freeMins = room.freeDurationMinutes % 60;
            const freeText =
              room.freeDurationMinutes > 899
                ? 'Free all day'
                : freeHours > 0
                ? `${freeHours}h ${freeMins > 0 ? `${freeMins}m` : ''} free`
                : `${freeMins}m free`;

            const catLabel =
              room.category === 'laboratory'
                ? 'Computer Lab'
                : room.category === 'auditorium'
                ? 'Auditorium'
                : 'Classroom';

            return (
              <article
                key={room.room}
                onClick={() => setInspectingRoom(room)}
                className="p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                {/* Top Row: Room Code + Free duration badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 shadow-xs"
                      aria-hidden="true"
                    >
                      <DoorOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[var(--md-sys-color-on-surface)]">
                        {room.room}
                      </h4>
                      <span className="text-[10px] font-bold text-[var(--md-sys-color-outline)]">
                        {catLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                    <span>{freeText}</span>
                  </div>
                </div>

                {/* Middle info: Next class or free status */}
                <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  {room.nextClass ? (
                    <div className="space-y-0.5 truncate">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                        Next Session ({room.nextClass.TIME_FROM})
                      </div>
                      <div className="font-semibold truncate text-[var(--md-sys-color-on-surface)]">
                        {room.nextClass.MODULE_NAME}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>No more sessions today</span>
                    </div>
                  )}
                </div>

                {/* Bottom link: View Schedule */}
                <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-primary)]">
                  <span>View Day Timeline</span>
                  <span aria-hidden="true">→</span>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Room Schedule Modal */}
      {inspectingRoom && (
        <RoomModal room={inspectingRoom} onClose={() => setInspectingRoom(null)} />
      )}
    </div>
  );
}
