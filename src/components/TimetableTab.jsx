import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  CalendarDays,
  CalendarPlus,
  Compass,
  Check,
  Clock,
  Layers,
  ArrowUpDown,
  X,
  Sparkles
} from 'lucide-react';
import ClassCard from './ClassCard';
import GapSuggestionCard from './GapSuggestionCard';
import {
  extractIntakes,
  extractGroupings,
  extractAvailableWeeks,
  filterTimetable,
  sortClasses
} from '../utils/api';
import { exportToICS } from '../utils/calendar';
import { parseTimeToMinutes, findNearbyFreeRooms } from '../utils/proximity';

const SCHOOL_DAYS = [
  { key: 'MON', label: 'Monday', short: 'Mon' },
  { key: 'TUE', label: 'Tuesday', short: 'Tue' },
  { key: 'WED', label: 'Wednesday', short: 'Wed' },
  { key: 'THU', label: 'Thursday', short: 'Thu' },
  { key: 'FRI', label: 'Friday', short: 'Fri' }
];

export default function TimetableTab({ allTimetables, loading, intakeModalTrigger, onIntakeModalTriggerConsumed }) {
  // Persistent State
  const [intakeInput, setIntakeInput] = useState(() => {
    return localStorage.getItem('last_intake') || '';
  });
  const [selectedIntake, setSelectedIntake] = useState(() => {
    return localStorage.getItem('last_intake') || '';
  });

  const [selectedGrouping, setSelectedGrouping] = useState(() => {
    return localStorage.getItem('timetable_grouping') || 'All';
  });

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('timetable_view_mode') || 'daily'; // 'daily' or 'weekly'
  });

  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem('timetable_sort_option') || 'time_asc';
  });

  // Automatically go to current day of the week (MON-FRI, defaults to MON on weekends)
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const current = days[new Date().getDay()];
    return current === 'SUN' || current === 'SAT' ? 'MON' : current;
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // Listen to external trigger from header if provided
  useEffect(() => {
    if (intakeModalTrigger) {
      setShowIntakeModal(true);
      if (onIntakeModalTriggerConsumed) onIntakeModalTriggerConsumed();
    }
  }, [intakeModalTrigger, onIntakeModalTriggerConsumed]);

  // Available weeks from timetable data
  const availableWeeks = useMemo(() => {
    return extractAvailableWeeks(allTimetables);
  }, [allTimetables]);

  const [selectedWeekKey, setSelectedWeekKey] = useState('');

  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeekKey) {
      setSelectedWeekKey(availableWeeks[0].key);
    }
  }, [availableWeeks, selectedWeekKey]);

  // All intakes for search dropdown
  const allIntakes = useMemo(() => {
    return extractIntakes(allTimetables);
  }, [allTimetables]);

  // Autocomplete suggestions
  const intakeSuggestions = useMemo(() => {
    if (!intakeInput.trim()) return allIntakes.slice(0, 15);
    const query = intakeInput.trim().toUpperCase();
    return allIntakes.filter((code) => code.toUpperCase().includes(query)).slice(0, 20);
  }, [allIntakes, intakeInput]);

  const handleSelectIntake = (intake) => {
    setSelectedIntake(intake);
    setIntakeInput(intake);
    localStorage.setItem('last_intake', intake);
    setShowIntakeModal(false);
  };

  // Filtered classes for selected intake and week
  const rawIntakeClasses = useMemo(() => {
    return filterTimetable(allTimetables, selectedIntake, selectedGrouping, selectedWeekKey);
  }, [allTimetables, selectedIntake, selectedGrouping, selectedWeekKey]);

  // Deduplicate and apply search filter
  const intakeClasses = useMemo(() => {
    const seen = new Set();
    const unique = [];

    rawIntakeClasses.forEach((item) => {
      const key = `${item.MODID}_${item.TIME_FROM_ISO}_${item.TIME_TO_ISO}_${item.ROOM}_${item.CLASS_CODE}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    if (!searchFilter.trim()) return unique;
    const q = searchFilter.trim().toUpperCase();
    return unique.filter(
      (c) =>
        (c.MODULE_NAME || '').toUpperCase().includes(q) ||
        (c.MODID || '').toUpperCase().includes(q) ||
        (c.ROOM || '').toUpperCase().includes(q) ||
        (c.NAME || '').toUpperCase().includes(q)
    );
  }, [rawIntakeClasses, searchFilter]);

  // Groupings available for this intake
  const availableGroupings = useMemo(() => {
    return extractGroupings(allTimetables, selectedIntake);
  }, [allTimetables, selectedIntake]);

  // Classes by day (Mon-Fri only)
  const classesByDay = useMemo(() => {
    const map = { MON: [], TUE: [], WED: [], THU: [], FRI: [] };
    intakeClasses.forEach((item) => {
      if (map[item.DAY]) {
        map[item.DAY].push(item);
      }
    });

    // Sort each day's classes
    Object.keys(map).forEach((day) => {
      map[day] = sortClasses(map[day], sortOption);
    });

    return map;
  }, [intakeClasses, sortOption]);

  // Classes for currently selected day
  const dailyClasses = useMemo(() => {
    return classesByDay[selectedDay] || [];
  }, [classesByDay, selectedDay]);

  // Daily Display Items with Smart Gap Finder suggestions
  const dailyDisplayItems = useMemo(() => {
    if (viewMode !== 'daily' || dailyClasses.length === 0) return [];

    const items = [];
    for (let i = 0; i < dailyClasses.length; i++) {
      const current = dailyClasses[i];
      items.push({ type: 'class', data: current, id: `class-${i}` });

      if (i < dailyClasses.length - 1) {
        const next = dailyClasses[i + 1];
        const currentEnd = parseTimeToMinutes(current.TIME_TO);
        const nextStart = parseTimeToMinutes(next.TIME_FROM);
        const gapMinutes = nextStart - currentEnd;

        // Gap of at least 20 minutes: detect nearest free study rooms
        if (gapMinutes >= 20) {
          const suggestions = findNearbyFreeRooms(
            allTimetables,
            selectedDay,
            currentEnd,
            nextStart,
            current.ROOM || ''
          );

          items.push({
            type: 'gap',
            id: `gap-${i}`,
            gapMinutes,
            fromTime: current.TIME_TO,
            toTime: next.TIME_FROM,
            previousRoom: current.ROOM || 'TBA',
            suggestions
          });
        }
      }
    }
    return items;
  }, [viewMode, dailyClasses, allTimetables, selectedDay]);

  // Today's day code
  const todayCode = useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const c = days[new Date().getDay()];
    return c === 'SUN' || c === 'SAT' ? 'MON' : c;
  });

  // Export current week to calendar
  const handleExportWeek = () => {
    if (!intakeClasses || intakeClasses.length === 0) {
      alert('No classes found to export for this week.');
      return;
    }
    exportToICS(intakeClasses, `Timetable_${selectedIntake || 'APU'}_Week.ics`);
  };

  return (
    <div className="space-y-5">
      {/* WEB CONTROL PANEL */}
      <section className="p-4 sm:p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-4">
        {/* Row 1: Intake Selector + View Mode Switcher + Export Calendar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowIntakeModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-black hover:opacity-90 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shadow-xs"
            >
              <Compass className="w-4 h-4 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
              <span>{selectedIntake ? selectedIntake : 'Choose Intake Code'}</span>
            </button>

            {availableWeeks.length > 1 && (
              <select
                value={selectedWeekKey}
                onChange={(e) => setSelectedWeekKey(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer"
              >
                {availableWeeks.map((w) => (
                  <option key={w.key} value={w.key}>
                    Week {w.label}
                  </option>
                ))}
              </select>
            )}

            {/* Total classes count badge */}
            {selectedIntake && (
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                {intakeClasses.length} {intakeClasses.length === 1 ? 'class this week' : 'classes this week'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Day vs Week) */}
            <div className="inline-flex p-1 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode('daily');
                  localStorage.setItem('timetable_view_mode', 'daily');
                }}
                className={`px-4 py-1.5 rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  viewMode === 'daily'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('weekly');
                  localStorage.setItem('timetable_view_mode', 'weekly');
                }}
                className={`px-4 py-1.5 rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                  viewMode === 'weekly'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                Week
              </button>
            </div>

            {/* Add Week to Calendar Button */}
            <button
              type="button"
              onClick={handleExportWeek}
              disabled={intakeClasses.length === 0}
              title="Add all classes for this week to Apple/Google/Outlook Calendar (.ics)"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:opacity-90 text-xs font-black transition cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shadow-xs"
            >
              <CalendarPlus className="w-4 h-4" aria-hidden="true" />
              <span>Export Week</span>
            </button>
          </div>
        </div>

        {/* Row 2: 5-Day School Week Selector (Mon-Fri) when in Daily Mode */}
        {viewMode === 'daily' && (
          <div className="grid grid-cols-5 gap-2 pt-1">
            {SCHOOL_DAYS.map((d) => {
              const isSelected = selectedDay === d.key;
              const isToday = todayCode === d.key;
              const count = classesByDay[d.key]?.length || 0;

              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`py-3 px-2 rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                      : isToday
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/40'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black tracking-tight">{d.short}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected
                        ? 'text-[var(--md-sys-color-on-primary)]/80'
                        : isToday
                        ? 'text-[var(--md-sys-color-primary)]'
                        : 'text-[var(--md-sys-color-outline)]'
                    }`}
                  >
                    {count} {count === 1 ? 'class' : 'classes'}
                  </span>
                  {isToday && !isSelected && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--md-sys-color-primary)] mt-0.5">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Row 3: Quick Filter Search Input & Group Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/20">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--md-sys-color-outline)]" aria-hidden="true" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search module name, code, lecturer, or room..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)]"
            />
          </div>

          {availableGroupings.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-outline)] shrink-0">
                Group:
              </span>
              {availableGroupings.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => {
                    setSelectedGrouping(grp);
                    localStorage.setItem('timetable_grouping', grp);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                    selectedGrouping === grp
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN TIMETABLE CONTENT */}
      {!selectedIntake ? (
        <section className="py-24 text-center space-y-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-8 max-w-xl mx-auto">
          <div
            className="w-14 h-14 mx-auto rounded-3xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs"
            aria-hidden="true"
          >
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-[var(--md-sys-color-on-surface)]">
              Select Your Course Intake
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              Choose your APU intake code (e.g. UC3F2404CS) to load your weekly schedule, class times, and nearby free study rooms.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIntakeModal(true)}
            className="px-6 py-3 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-black hover:opacity-95 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shadow-sm"
          >
            Choose Intake Code
          </button>
        </section>
      ) : viewMode === 'daily' ? (
        /* DAILY VIEW */
        <section className="space-y-3.5" aria-label={`Timetable for ${selectedDay}`}>
          {dailyDisplayItems.length === 0 ? (
            <div className="py-20 text-center space-y-2 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-6">
              <CalendarDays className="w-10 h-10 mx-auto text-[var(--md-sys-color-outline)]" aria-hidden="true" />
              <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                No classes scheduled for {selectedDay}
              </h4>
              <p className="text-xs text-[var(--md-sys-color-outline)]">
                Enjoy your study break or check another weekday!
              </p>
            </div>
          ) : (
            dailyDisplayItems.map((item) =>
              item.type === 'class' ? (
                <ClassCard key={item.id} cls={item.data} />
              ) : (
                <GapSuggestionCard key={item.id} gap={item} />
              )
            )
          )}
        </section>
      ) : (
        /* FULL RESPONSIVE 5-DAY SCHOOL WEEK VIEW */
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" aria-label="Weekly Timetable Grid">
          {SCHOOL_DAYS.map((d) => {
            const dayClasses = classesByDay[d.key] || [];
            const isToday = todayCode === d.key;

            return (
              <div
                key={d.key}
                className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex flex-col space-y-3 ${
                  isToday
                    ? 'bg-[var(--md-sys-color-surface-container-high)] border-[var(--md-sys-color-primary)]/40 shadow-xs'
                    : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]/20'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
                      {d.label}
                    </span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-outline)]">
                    {dayClasses.length}
                  </span>
                </div>

                {/* Day Classes */}
                {dayClasses.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--md-sys-color-outline)] italic">
                    No classes
                  </div>
                ) : (
                  <div className="space-y-2.5 flex-1">
                    {dayClasses.map((cls, idx) => (
                      <ClassCard key={idx} cls={cls} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* INTAKE SELECTOR MODAL */}
      {showIntakeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intake-dialog-title"
          onClick={() => setShowIntakeModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-2xl overflow-hidden focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[var(--md-sys-color-surface-container-high)] flex items-center justify-between">
              <div>
                <h3 id="intake-dialog-title" className="text-base font-black text-[var(--md-sys-color-on-surface)]">
                  Select Course Intake Code
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                  Browse {allIntakes.length} intakes available in the campus database
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIntakeModal(false)}
                aria-label="Close dialog"
                className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--md-sys-color-outline)]" aria-hidden="true" />
                <input
                  type="text"
                  value={intakeInput}
                  onChange={(e) => setIntakeInput(e.target.value)}
                  placeholder="Type intake code (e.g. UC3F2404CS, APU2F)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
                  autoFocus
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {intakeSuggestions.length === 0 ? (
                  <p className="text-xs text-[var(--md-sys-color-outline)] text-center py-8">
                    No intake found matching "{intakeInput}"
                  </p>
                ) : (
                  intakeSuggestions.map((intake) => {
                    const isSelected = selectedIntake === intake;
                    return (
                      <button
                        key={intake}
                        type="button"
                        onClick={() => handleSelectIntake(intake)}
                        className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                          isSelected
                            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                            : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                        }`}
                      >
                        <span>{intake}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[var(--md-sys-color-primary)] stroke-[3]" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
