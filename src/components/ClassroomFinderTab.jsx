import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  DoorOpen,
  ChevronDown,
  ChevronUp
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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
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
    <div className="space-y-4">
      {/* COMPACT FILTER BAR */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-3">
        {/* Row 1: Summary Pill (Tappable to expand filters) + Sort */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-black hover:opacity-90 transition cursor-pointer"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>
              {availableRooms.length} empty · {selectedDay} {fromTime}–{toTime}
            </span>
            {isFiltersExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'longest_free' ? 'room_asc' : 'longest_free')}
            title="Sort rooms"
            className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Detailed Filters */}
        {isFiltersExpanded && (
          <div className="space-y-3 pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20">
            {/* 5-Day School Week Grid (MON-FRI) */}
            <div className="grid grid-cols-5 gap-1.5">
              {SCHOOL_DAYS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`py-1.5 rounded-xl text-center text-xs font-black transition cursor-pointer ${
                    selectedDay === d.key
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                >
                  {d.key}
                </button>
              ))}
            </div>

            {/* Category Grid (4 columns) */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'classroom', label: 'Room' },
                { id: 'laboratory', label: 'Lab' },
                { id: 'auditorium', label: 'Hall' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-xs'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Time Inputs + Presets */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-1/2 p-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-hidden"
              />
              <span className="text-xs text-[var(--md-sys-color-outline)]">to</span>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-1/2 p-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-hidden"
              />
            </div>

            {/* Presets (3 columns) */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'now', label: 'Now +1h' },
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className="py-1 px-2 rounded-lg text-[11px] font-bold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] hover:opacity-80 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--md-sys-color-outline)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room name (e.g. B-05-03)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* ROOM LIST */}
      {availableRooms.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-6">
          <DoorOpen className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)]" />
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            No Empty Rooms Found
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs mx-auto">
            All rooms are currently in session or booked during this time window. Try adjusting the time window or day.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
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
              room.category === 'laboratory' ? 'Lab' : room.category === 'auditorium' ? 'Hall' : 'Room';

            const nextInfo = room.nextClass
              ? `Next: ${room.nextClass.TIME_FROM} ${room.nextClass.MODULE_NAME}`
              : '✓ No more classes today';

            return (
              <div
                key={room.room}
                onClick={() => setInspectingRoom(room)}
                className="p-3 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-xs transition cursor-pointer space-y-1"
              >
                {/* Line 1: Room name + Green status dot + Free duration */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--md-sys-color-on-surface)]">
                    <DoorOpen className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                    <span>{room.room}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{freeText}</span>
                  </div>
                </div>

                {/* Line 2: Category + Next class */}
                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                  <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{catLabel}</span>
                  <span className="mx-1 text-[var(--md-sys-color-outline)]">·</span>
                  <span className="truncate">{nextInfo}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Schedule Modal */}
      {inspectingRoom && (
        <RoomModal room={inspectingRoom} onClose={() => setInspectingRoom(null)} />
      )}
    </div>
  );
}
