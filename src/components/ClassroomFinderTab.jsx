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
  AlertCircle,
  User,
  Users,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { findClassrooms } from '../utils/classroom';
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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'free' | 'occupied'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('room_asc');
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

  // 1. Evaluate all rooms without status filter to count totals accurately
  const allEvaluatedRooms = useMemo(() => {
    return findClassrooms(
      allTimetables,
      selectedDay,
      fromTime,
      toTime,
      selectedCategory,
      '',
      'all',
      sortBy
    );
  }, [allTimetables, selectedDay, fromTime, toTime, selectedCategory, sortBy]);

  const stats = useMemo(() => {
    let freeCount = 0;
    let occupiedCount = 0;
    allEvaluatedRooms.forEach((r) => {
      if (r.status === 'free') freeCount++;
      else occupiedCount++;
    });
    return {
      total: allEvaluatedRooms.length,
      free: freeCount,
      occupied: occupiedCount
    };
  }, [allEvaluatedRooms]);

  // 2. Filtered list with user's status filter and search query applied
  const displayedRooms = useMemo(() => {
    return findClassrooms(
      allTimetables,
      selectedDay,
      fromTime,
      toTime,
      selectedCategory,
      searchQuery,
      statusFilter,
      sortBy
    );
  }, [allTimetables, selectedDay, fromTime, toTime, selectedCategory, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-5">
      {/* WEB FILTER & CONTROL PANEL */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-4">
        {/* Row 1: Day Selector (Mon-Fri) + Category Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 5-Day School Week Strip */}
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

        {/* Row 2: Status Toggle (All vs Free vs In Session) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/20">
          <div className="inline-flex p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                statusFilter === 'all'
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-black'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <span>All Classrooms</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'all' ? 'bg-white/20' : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)]'}`}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('free')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                statusFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
              <span>Available (Free)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'free' ? 'bg-white/20' : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)]'}`}>
                {stats.free}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('occupied')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                statusFilter === 'occupied'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" aria-hidden="true" />
              <span>Class In Session</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${statusFilter === 'occupied' ? 'bg-white/20' : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)]'}`}>
                {stats.occupied}
              </span>
            </button>
          </div>

          {/* Time Picker & Presets */}
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              aria-label="From time"
              className="p-1.5 px-2.5 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
            />
            <span className="text-xs text-[var(--md-sys-color-outline)] font-semibold">to</span>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              aria-label="To time"
              className="p-1.5 px-2.5 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
            />

            <div className="hidden sm:flex items-center gap-1">
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
        </div>

        {/* Row 3: Live Search across all rooms, modules, and lecturers + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/20">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--md-sys-color-outline)]" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room (e.g. B-05-02, Aud 1), module name, or lecturer..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)]"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30">
            <ArrowUpDown className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--md-sys-color-on-surface)] focus:outline-none cursor-pointer"
            >
              <option value="room_asc">Room Name (A → Z)</option>
              <option value="room_desc">Room Name (Z → A)</option>
              <option value="longest_free">Longest Free Time First</option>
              <option value="occupied_first">Class In Session First</option>
              <option value="category">Category (Classroom / Lab)</option>
            </select>
          </div>
        </div>
      </section>

      {/* RESULTS STATS BANNER */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              statusFilter === 'free'
                ? 'bg-emerald-500'
                : statusFilter === 'occupied'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-[var(--md-sys-color-primary)]'
            }`}
            aria-hidden="true"
          />
          <h3 className="text-sm font-black text-[var(--md-sys-color-on-surface)]">
            {displayedRooms.length} {displayedRooms.length === 1 ? 'Classroom Found' : 'Classrooms Found'}
          </h3>
          <span className="text-xs text-[var(--md-sys-color-outline)]">
            ({selectedDay}, {fromTime} – {toTime} • {stats.free} Free, {stats.occupied} In Session)
          </span>
        </div>

        {searchQuery && (
          <span className="text-xs font-semibold text-[var(--md-sys-color-primary)]">
            Matching "{searchQuery}"
          </span>
        )}
      </div>

      {/* ROOMS RESPONSIVE GRID (ALL CLASSROOMS) */}
      {displayedRooms.length === 0 ? (
        <section className="py-24 text-center space-y-3 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-8">
          <DoorOpen className="w-12 h-12 mx-auto text-[var(--md-sys-color-outline)]" aria-hidden="true" />
          <h4 className="text-base font-black text-[var(--md-sys-color-on-surface)]">
            No Classrooms Found
          </h4>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mx-auto">
            No rooms matched your current filter criteria. Try clearing the search query or switching to "All Classrooms".
          </p>
          {(statusFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition cursor-pointer"
            >
              Show All Classrooms
            </button>
          )}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Classroom Directory">
          {displayedRooms.map((room) => {
            const isFree = room.status === 'free';
            const durationMins = Number(room.freeDurationMinutes ?? room.freeDurationMins) || 0;
            const freeHours = Math.floor(durationMins / 60);
            const freeMins = durationMins % 60;
            const freeText =
              durationMins >= 720 || !room.nextClass
                ? 'Free all day'
                : freeHours > 0
                ? `${freeHours}h ${freeMins > 0 ? `${freeMins}m ` : ''}free`
                : freeMins > 0
                ? `${freeMins}m free`
                : 'Free now';

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
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isFree
                    ? 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]/20 hover:border-[var(--md-sys-color-primary)]/40 hover:shadow-xs'
                    : 'bg-[var(--md-sys-color-surface-container-high)]/60 border-amber-500/30 hover:border-amber-500/60 hover:shadow-xs'
                }`}
              >
                {/* Line 1: Room Code + Status Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isFree
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
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

                  {/* Status Indicator Pill */}
                  {isFree ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                      <span>{freeText}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" aria-hidden="true" />
                      <span>In Session</span>
                    </div>
                  )}
                </div>

                {/* Line 2: Details Body (Ongoing Class or Next Class) */}
                <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20 space-y-1.5 text-xs">
                  {room.isOccupied && room.currentClass ? (
                    /* Occupied Room: Show Active Class Details */
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span>{room.currentClass.TIME_FROM} – {room.currentClass.TIME_TO}</span>
                        </span>
                        {room.currentClass.INTAKE && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15">
                            {room.currentClass.INTAKE}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-[var(--md-sys-color-on-surface)] line-clamp-1">
                        {room.currentClass.MODULE_NAME}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-[var(--md-sys-color-outline)] shrink-0" aria-hidden="true" />
                          <span className="truncate">{room.currentClass.NAME || room.currentClass.LECTID || 'Staff'}</span>
                        </span>
                        {room.currentClass.GROUPING && (
                          <span className="text-[10px] text-[var(--md-sys-color-outline)] shrink-0">
                            Grp {room.currentClass.GROUPING}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Free Room: Show Next Upcoming Class */
                    <div className="space-y-1">
                      {room.nextClass ? (
                        <>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>Next: {room.nextClass.TIME_FROM} – {room.nextClass.TIME_TO}</span>
                          </div>
                          <div className="font-semibold text-[var(--md-sys-color-on-surface)] line-clamp-1">
                            {room.nextClass.MODULE_NAME}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold py-1">
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>No more classes scheduled today</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Line 3: Footer with schedule count and modal link */}
                <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[var(--md-sys-color-outline)]">
                    {room.totalClassesToday} {room.totalClassesToday === 1 ? 'class today' : 'classes today'}
                  </span>
                  <span className="text-[var(--md-sys-color-primary)] flex items-center gap-1">
                    <span>View Schedule</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Room Schedule Modal */}
      {inspectingRoom && (
        <RoomModal room={inspectingRoom} day={selectedDay} onClose={() => setInspectingRoom(null)} />
      )}
    </div>
  );
}
