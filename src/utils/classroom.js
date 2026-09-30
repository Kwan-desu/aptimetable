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

// Find available classrooms with sorting
export function findAvailableClassrooms(
  timetables,
  day,
  fromTime24,
  toTime24,
  category = 'all',
  searchQuery = '',
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

  const availableRooms = [];

  allRooms.forEach((room) => {
    if (category !== 'all') {
      const cat = ROOM_CATEGORIES.find((c) => c.key === category);
      if (cat && cat.prefixes) {
        const matches = cat.prefixes.some((p) => room.includes(p));
        if (!matches) return;
      }
    }

    if (searchQuery && !room.toLowerCase().includes(searchQuery.toLowerCase())) {
      return;
    }

    const classesToday = roomScheduleMap.get(room) || [];
    let isOccupied = false;

    if (room.toUpperCase().includes('LAB') && (startMins >= 19 * 60 || endMins >= 19 * 60)) {
      isOccupied = true;
    }

    if (!isOccupied) {
      for (const cls of classesToday) {
        const classStart = parseTimeToMinutes(cls.TIME_FROM);
        const classEnd = parseTimeToMinutes(cls.TIME_TO);

        if (startMins < classEnd && endMins > classStart) {
          isOccupied = true;
          break;
        }
      }
    }

    if (!isOccupied) {
      const upcoming = classesToday
        .map((c) => ({
          ...c,
          startMins: parseTimeToMinutes(c.TIME_FROM),
          endMins: parseTimeToMinutes(c.TIME_TO)
        }))
        .filter((c) => c.startMins >= endMins)
        .sort((a, b) => a.startMins - b.startMins);

      // Free duration: minutes until next class starts, or 9999 if free all day
      const freeUntilMins = upcoming.length > 0 ? upcoming[0].startMins : 24 * 60;
      const freeDurationMins = Math.max(0, freeUntilMins - endMins);

      availableRooms.push({
        room,
        category: getRoomCategory(room),
        nextClass: upcoming.length > 0 ? upcoming[0] : null,
        freeDurationMins,
        freeDurationMinutes: freeDurationMins,
        totalClassesToday: classesToday.length,
        scheduleToday: classesToday.sort(
          (a, b) => parseTimeToMinutes(a.TIME_FROM) - parseTimeToMinutes(b.TIME_FROM)
        )
      });
    }
  });

  // Apply Sorting
  return availableRooms.sort((a, b) => {
    if (sortBy === 'longest_free') {
      return b.freeDurationMins - a.freeDurationMins;
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
