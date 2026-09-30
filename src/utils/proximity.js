/**
 * Proximity and Gap Finder utilities for APTimetable
 */

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    const parts = timeStr.split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  const parts = timeStr.trim().split(' ');
  const rawTime = parts[0] || '';
  const amPm = (parts[1] || '').toUpperCase();
  const timeParts = rawTime.split(':');
  let h = parseInt(timeParts[0], 10) || 0;
  const m = parseInt(timeParts[1], 10) || 0;
  if (amPm === 'PM' && h < 12) h += 12;
  if (amPm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export function parseRoomLocation(room) {
  if (!room) return { building: '', floor: '' };
  const cleaned = room.trim().toUpperCase();
  // Match patterns like "B-05-03", "A-03-01", "D-06-02"
  const match = cleaned.match(/([A-Z])-(\d+)-\d+/);
  if (match) {
    return { building: match[1], floor: match[2] };
  }
  return { building: cleaned.slice(0, 3), floor: '' };
}

export function proximityScore(fromRoom, toRoom) {
  const a = parseRoomLocation(fromRoom);
  const b = parseRoomLocation(toRoom);
  if (a.building && b.building && a.building === b.building && a.floor === b.floor) {
    return 0; // Same floor
  }
  if (a.building && b.building && a.building === b.building) {
    return 1; // Same building
  }
  return 2; // Different building / nearby
}

export function proximityLabel(score) {
  switch (score) {
    case 0:
      return 'Same floor';
    case 1:
      return 'Same building';
    default:
      return 'Nearby';
  }
}

/**
 * Finds free rooms between `currentEnd` and `nextStart` on `day`
 * and ranks them by proximity to `previousRoom`.
 */
export function findNearbyFreeRooms(allClasses, day, currentEndMins, nextStartMins, previousRoom) {
  if (!allClasses || !Array.isArray(allClasses)) return [];

  // Group classes by room for the given day
  const roomScheduleMap = new Map();
  const allRooms = new Set();

  allClasses.forEach((item) => {
    const room = item.ROOM;
    if (room && !room.toUpperCase().includes('ONLINE') && !room.toUpperCase().includes('ONL')) {
      allRooms.add(room);
      if (item.DAY === day) {
        if (!roomScheduleMap.has(room)) roomScheduleMap.set(room, []);
        roomScheduleMap.get(room).push(item);
      }
    }
  });

  const freeRooms = [];

  allRooms.forEach((room) => {
    const schedule = roomScheduleMap.get(room) || [];
    let isOccupied = false;

    // Check if occupied during window
    for (const cls of schedule) {
      const cStart = parseTimeToMinutes(cls.TIME_FROM);
      const cEnd = parseTimeToMinutes(cls.TIME_TO);
      if (currentEndMins < cEnd && nextStartMins > cStart) {
        isOccupied = true;
        break;
      }
    }

    if (!isOccupied) {
      const score = proximityScore(previousRoom, room);

      // Find how long this room stays free after currentEnd
      const upcoming = schedule
        .filter((c) => parseTimeToMinutes(c.TIME_FROM) >= currentEndMins)
        .sort((a, b) => parseTimeToMinutes(a.TIME_FROM) - parseTimeToMinutes(b.TIME_FROM));

      const freeUntil = upcoming.length > 0 ? parseTimeToMinutes(upcoming[0].TIME_FROM) : 24 * 60;
      const freeMinutes = Math.max(0, freeUntil - currentEndMins);

      freeRooms.push({
        room,
        score,
        label: proximityLabel(score),
        freeMinutes
      });
    }
  });

  // Sort by proximity first, then longest free time
  return freeRooms
    .sort((a, b) => a.score - b.score || b.freeMinutes - a.freeMinutes)
    .slice(0, 5); // top 5 suggestions
}
