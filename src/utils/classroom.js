export const ROOM_CATEGORIES = [
  { key: 'all', name: 'All Types' },
  { key: 'classroom', name: 'Classrooms', prefixes: ['A-', 'B-', 'C-', 'D-', 'E-', 'L3'] },
  { key: 'auditorium', name: 'Auditoriums', prefixes: ['Auditorium'] },
  { key: 'laboratory', name: 'Labs & Workshops', prefixes: ['LAB', 'Lab', 'Workshop', 'Studio', 'Suite'] }
];

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  const [rawTime, modifier] = timeStr.split(' ');
  let [hours, minutes] = rawTime.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + (minutes || 0);
}

export function getRoomCategory(room) {
  if (!room) return 'classroom';
  if (room.toUpperCase().includes('AUDITORIUM')) return 'auditorium';
  if (
    room.toUpperCase().includes('LAB') ||
    room.toUpperCase().includes('WORKSHOP') ||
    room.toUpperCase().includes('STUDIO') ||
    room.toUpperCase().includes('SUITE')
  ) {
    return 'laboratory';
  }
  return 'classroom';
}

/**
 * Find and evaluate ALL classrooms for a given time window:
 * returns every classroom with status ('free' | 'occupied'),
 * current active class (if occupied), next upcoming class,
 * free duration, and full day schedule.
 */
export function findClassrooms(
  timetables,
  day,
  fromTime24,
  toTime24,
  category = 'all',
  searchQuery = '',
  statusFilter = 'all', // 'all' | 'free' | 'occupied'
  sortBy = 'room_asc'
) {
  if (!timetables || !Array.isArray(timetables)) return [];

  const startMins = parseTimeToMinutes(fromTime24);
  const endMins = parseTimeToMinutes(toTime24);

  const allRooms = new Set();
  const roomScheduleMap = new Map();

  timetables.forEach((item) => {
    const room = item.ROOM;
    if (!room || room.toUpperCase().includes('ONLINE') || room.toUpperCase().includes('ONL')) {
      return;
    }
    allRooms.add(room);

    if (item.DAY === day) {
      if (!roomScheduleMap.has(room)) {
        roomScheduleMap.set(room, []);
      }
      roomScheduleMap.get(room).push(item);
    }
  });

  const evaluatedRooms = [];

  allRooms.forEach((room) => {
    // 1. Filter by category
    if (category !== 'all') {
      const cat = ROOM_CATEGORIES.find((c) => c.key === category);
      if (cat && cat.prefixes) {
        const matches = cat.prefixes.some((p) => room.includes(p));
        if (!matches) return;
      }
    }

    const classesToday = roomScheduleMap.get(room) || [];
    const sortedClassesToday = [...classesToday].sort(
      (a, b) => parseTimeToMinutes(a.TIME_FROM) - parseTimeToMinutes(b.TIME_FROM)
    );

    // 2. Check if occupied during [startMins, endMins]
    let isOccupied = false;
    let currentClass = null;

    // Rule: Labs closed after 19:00 (7 PM)
    if (room.toUpperCase().includes('LAB') && (startMins >= 19 * 60 || endMins >= 19 * 60)) {
      isOccupied = true;
      currentClass = {
        MODULE_NAME: 'Lab Facility Closed (After 19:00)',
        TIME_FROM: '19:00',
        TIME_TO: '23:59',
        NAME: 'Campus Security',
        INTAKE: 'CLOSED'
      };
    }

    if (!isOccupied) {
      for (const cls of sortedClassesToday) {
        const classStart = parseTimeToMinutes(cls.TIME_FROM);
        const classEnd = parseTimeToMinutes(cls.TIME_TO);

        if (startMins < classEnd && endMins > classStart) {
          isOccupied = true;
          currentClass = cls;
          break;
        }
      }
    }

    // 3. Find next upcoming class after current window (or after current class end)
    const referenceEnd = isOccupied && currentClass && currentClass.TIME_TO
      ? parseTimeToMinutes(currentClass.TIME_TO)
      : endMins;

    const upcoming = sortedClassesToday
      .map((c) => ({
        ...c,
        startMins: parseTimeToMinutes(c.TIME_FROM),
        endMins: parseTimeToMinutes(c.TIME_TO)
      }))
      .filter((c) => c.startMins >= referenceEnd)
      .sort((a, b) => a.startMins - b.startMins);

    const nextClass = upcoming.length > 0 ? upcoming[0] : null;

    // 4. Calculate free duration
    let freeDurationMins = 0;
    if (!isOccupied) {
      const freeUntilMins = nextClass ? nextClass.startMins : 24 * 60;
      freeDurationMins = Math.max(0, freeUntilMins - endMins);
    }

    const roomStatus = isOccupied ? 'occupied' : 'free';

    // 5. Filter by status (all | free | occupied)
    if (statusFilter !== 'all' && roomStatus !== statusFilter) {
      return;
    }

    // 6. Search query matching room name, module, lecturer, or intake
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchRoom = room.toLowerCase().includes(q);
      const matchCurrentClass = currentClass && (
        (currentClass.MODULE_NAME || '').toLowerCase().includes(q) ||
        (currentClass.NAME || '').toLowerCase().includes(q) ||
        (currentClass.INTAKE || '').toLowerCase().includes(q) ||
        (currentClass.MODID || '').toLowerCase().includes(q)
      );
      const matchAnyClassToday = sortedClassesToday.some((c) =>
        (c.MODULE_NAME || '').toLowerCase().includes(q) ||
        (c.NAME || '').toLowerCase().includes(q) ||
        (c.INTAKE || '').toLowerCase().includes(q) ||
        (c.MODID || '').toLowerCase().includes(q)
      );

      if (!matchRoom && !matchCurrentClass && !matchAnyClassToday) {
        return;
      }
    }

    evaluatedRooms.push({
      room,
      category: getRoomCategory(room),
      status: roomStatus,
      isOccupied,
      currentClass,
      nextClass,
      freeDurationMins,
      freeDurationMinutes: freeDurationMins,
      totalClassesToday: sortedClassesToday.length,
      scheduleToday: sortedClassesToday
    });
  });

  // 7. Apply Sorting
  return evaluatedRooms.sort((a, b) => {
    if (sortBy === 'longest_free') {
      // Free rooms first by longest duration, then occupied rooms
      if (a.status !== b.status) {
        return a.status === 'free' ? -1 : 1;
      }
      return b.freeDurationMins - a.freeDurationMins;
    }
    if (sortBy === 'occupied_first') {
      if (a.status !== b.status) {
        return a.status === 'occupied' ? -1 : 1;
      }
      return a.room.localeCompare(b.room, undefined, { numeric: true });
    }
    if (sortBy === 'room_desc') {
      return b.room.localeCompare(a.room, undefined, { numeric: true });
    }
    if (sortBy === 'category') {
      const catOrder = { classroom: 1, auditorium: 2, laboratory: 3 };
      const diff = (catOrder[a.category] || 9) - (catOrder[b.category] || 9);
      if (diff !== 0) return diff;
      return a.room.localeCompare(b.room, undefined, { numeric: true });
    }
    // Default room_asc
    return a.room.localeCompare(b.room, undefined, { numeric: true });
  });
}

// Backward-compatible alias
export function findAvailableClassrooms(
  timetables,
  day,
  fromTime24,
  toTime24,
  category = 'all',
  searchQuery = '',
  sortBy = 'room_asc'
) {
  return findClassrooms(
    timetables,
    day,
    fromTime24,
    toTime24,
    category,
    searchQuery,
    'free',
    sortBy
  );
}
