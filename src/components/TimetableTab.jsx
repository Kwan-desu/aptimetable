import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Compass,
  CalendarDays,
  X
} from 'lucide-react';
import ClassCard from './ClassCard';
import GapSuggestionCard from './GapSuggestionCard';
import {
  extractIntakes,
  extractGroupings,
  extractAvailableWeeks,
  filterTimetable,
  sortClasses,
  getClassStatus
} from '../utils/api';
import { exportToICS } from '../utils/calendar';
import { parseTimeToMinutes, findNearbyFreeRooms } from '../utils/proximity';

const SCHOOL_DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' }
];

export default function TimetableTab({ allTimetables, loading }) {
  // 1. Persistent State Memory (Intake, ViewMode, Grouping, Sort)
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
    if (!intakeInput.trim()) return allIntakes.slice(0, 10);
    const query = intakeInput.trim().toUpperCase();
    return allIntakes.filter((code) => code.toUpperCase().includes(query)).slice(0, 15);
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
  }, []);

  // Export current week to calendar
  const handleExportWeek = () => {
    if (!intakeClasses || intakeClasses.length === 0) {
      alert('No classes to export for this week');
      return;
    }
    exportToICS(intakeClasses, `Timetable_${selectedIntake || 'APU'}_Week.ics`);
  };

  return (
    <div className="space-y-4">
      {/* COMPACT TOOLBAR (No horizontal scroll) */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-3">
        {/* Row 1: Intake Selector Pill + View Mode Toggle + Add Week to Calendar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Intake Pill Button */}
          <button
            type="button"
            onClick={() => setShowIntakeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-black hover:opacity-90 transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{selectedIntake || 'Select Intake Code'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Day / Week Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode('daily');
                  localStorage.setItem('timetable_view_mode', 'daily');
                }}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'daily'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
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
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'weekly'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                Week
              </button>
            </div>

            {/* Prominent Add Week to Calendar Button */}
            <button
              type="button"
              onClick={handleExportWeek}
              disabled={intakeClasses.length === 0}
              title="Add all classes of this week to Calendar (.ics)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:opacity-90 text-xs font-bold transition cursor-pointer disabled:opacity-40"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Week</span>
            </button>
          </div>
        </div>

        {/* Row 2: Day Strip (5 columns, 100% width, MON-FRI only, NO horizontal scroll) */}
        {viewMode === 'daily' && (
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {SCHOOL_DAYS.map((d) => {
              const isSelected = selectedDay === d.key;
              const isToday = todayCode === d.key;
              const count = classesByDay[d.key]?.length || 0;

              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
                      : isToday
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">{d.key}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isSelected
                        ? 'text-[var(--md-sys-color-on-primary)]/80'
                        : 'text-[var(--md-sys-color-outline)]'
                    }`}
                  >
                    {count} {count === 1 ? 'class' : 'classes'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Row 3: Group & Sort filters (if multiple groups exist) */}
        {availableGroupings.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
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
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer shrink-0 ${
                  selectedGrouping === grp
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                    : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TIMETABLE CONTENT */}
      {!selectedIntake ? (
        <div className="py-20 text-center space-y-4 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20 p-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
              Select Your Intake Code
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mx-auto mt-1">
              Choose your course intake (e.g. APU2F2404CS) to view your schedule and nearest free classrooms.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIntakeModal(true)}
            className="px-5 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            Choose Intake Code
          </button>
        </div>
      ) : viewMode === 'daily' ? (
        /* DAILY VIEW */
        <div className="space-y-3">
          {dailyDisplayItems.length === 0 ? (
            <div className="py-16 text-center space-y-2 rounded-3xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/20">
              <p className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                No classes scheduled for {selectedDay}
              </p>
              <p className="text-xs text-[var(--md-sys-color-outline)]">
                Enjoy your free time or check another day!
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
        </div>
      ) : (
        /* WEEKLY VIEW (MON-FRI) */
        <div className="space-y-6">
          {SCHOOL_DAYS.map((d) => {
            const dayClasses = classesByDay[d.key] || [];
            return (
              <div key={d.key} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                    {d.key}
                  </span>
                  <span className="text-xs font-bold text-[var(--md-sys-color-outline)]">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                  </span>
                  <div className="flex-1 h-px bg-[var(--md-sys-color-outline-variant)]/20" />
                </div>

                {dayClasses.length === 0 ? (
                  <p className="text-xs text-[var(--md-sys-color-outline)] italic py-2 pl-2">
                    No classes
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {dayClasses.map((cls, idx) => (
                      <ClassCard key={idx} cls={cls} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* INTAKE SELECTOR MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md max-h-[80vh] flex flex-col rounded-3xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--md-sys-color-surface-container-high)] flex items-center justify-between">
              <h3 className="text-sm font-black">Select Intake Code</h3>
              <button
                type="button"
                onClick={() => setShowIntakeModal(false)}
                className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-outline)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--md-sys-color-outline)]" />
                <input
                  type="text"
                  value={intakeInput}
                  onChange={(e) => setIntakeInput(e.target.value)}
                  placeholder="Search intake code (e.g. UC3F2404CS)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 focus:outline-hidden focus:border-[var(--md-sys-color-primary)]"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {intakeSuggestions.map((intake) => (
                  <button
                    key={intake}
                    type="button"
                    onClick={() => handleSelectIntake(intake)}
                    className="w-full p-2.5 rounded-xl text-left text-xs font-bold hover:bg-[var(--md-sys-color-surface-container-high)] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{intake}</span>
                    {selectedIntake === intake && (
                      <Check className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
