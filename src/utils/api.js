const CACHE_KEY = 'apu_timetable_cache';
const CACHE_TIME_KEY = 'apu_timetable_cache_time';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' }
];

export async function fetchWeeklyTimetable(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_EXPIRY_MS) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
  }

  const endpoints = [
    '/api/weektimetable',
    'https://s3-ap-southeast-1.amazonaws.com/open-ws/weektimetable'
  ];

  let rawData = null;
  let lastError = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: forceRefresh ? { 'x-refresh': '1' } : {}
      });
      if (res.ok) {
        rawData = await res.json();
        break;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!rawData) {
    const fallbackCached = localStorage.getItem(CACHE_KEY);
    if (fallbackCached) {
      return JSON.parse(fallbackCached);
    }
    throw lastError || new Error('Failed to load timetable data from server');
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rawData));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  } catch (e) {
    console.warn('Cache write quota exceeded', e);
  }

  return rawData;
}

// Extract unique intake codes from timetable
export function extractIntakes(timetables) {
  if (!timetables || !Array.isArray(timetables)) return [];
  const set = new Set();
  timetables.forEach((item) => {
    if (item.INTAKE) {
      set.add(item.INTAKE.trim());
    }
  });
  return Array.from(set).sort();
}

// Extract unique groupings for a given intake
export function extractGroupings(timetables, intake) {
  if (!timetables || !intake) return ['All'];
  const set = new Set(['All']);
  timetables.forEach((item) => {
    if (item.INTAKE === intake && item.GROUPING) {
      set.add(item.GROUPING.trim());
    }
  });
  return Array.from(set);
}

// Helper to get start date of week (Monday)
export function getMondayOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

// Format week label e.g. "28 Sep - 04 Oct 2026"
export function formatWeekLabel(mondayDate) {
  const sunday = new Date(mondayDate);
  sunday.setDate(sunday.getDate() + 6);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDay = mondayDate.getDate();
  const startMonth = months[mondayDate.getMonth()];
  const endDay = sunday.getDate();
  const endMonth = months[sunday.getMonth()];
  const year = sunday.getFullYear();

  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
}

// Extract all distinct weeks present in timetable data
export function extractAvailableWeeks(timetables) {
  if (!timetables || !Array.isArray(timetables)) return [];
  const weeksMap = new Map();

  timetables.forEach((item) => {
    if (!item.DATESTAMP_ISO) return;
    const mon = getMondayOfWeek(new Date(item.DATESTAMP_ISO));
    const key = mon.toISOString().slice(0, 10);
    if (!weeksMap.has(key)) {
      weeksMap.set(key, {
        key,
        monday: mon,
        label: formatWeekLabel(mon)
      });
    }
  });

  return Array.from(weeksMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

// Check class time status: 'ongoing', 'upcoming', 'past'
export function getClassStatus(cls) {
  const now = new Date();
  const start = new Date(cls.TIME_FROM_ISO);
  const end = new Date(cls.TIME_TO_ISO);

  if (now >= start && now <= end) {
    return 'ongoing';
  } else if (now > end) {
    return 'past';
  } else {
    return 'upcoming';
  }
}

// Filter timetable by intake, group, and optional week
export function filterTimetable(timetables, intake, grouping = 'All', weekKey = null) {
  if (!timetables || !intake) return [];

  return timetables.filter((item) => {
    if (item.INTAKE !== intake) return false;

    if (grouping && grouping !== 'All') {
      if (item.GROUPING && item.GROUPING !== grouping) return false;
    }

    if (weekKey && item.DATESTAMP_ISO) {
      const mon = getMondayOfWeek(new Date(item.DATESTAMP_ISO)).toISOString().slice(0, 10);
      if (mon !== weekKey) return false;
    }

    return true;
  });
}

// Sorter for classes
export function sortClasses(classes, sortOption) {
  const list = [...classes];

  switch (sortOption) {
    case 'time_asc':
      return list.sort((a, b) => (a.TIME_FROM_ISO || '').localeCompare(b.TIME_FROM_ISO || ''));

    case 'time_desc':
      return list.sort((a, b) => (b.TIME_FROM_ISO || '').localeCompare(a.TIME_FROM_ISO || ''));

    case 'module_asc':
      return list.sort((a, b) => (a.MODULE_NAME || '').localeCompare(b.MODULE_NAME || ''));

    case 'module_desc':
      return list.sort((a, b) => (b.MODULE_NAME || '').localeCompare(a.MODULE_NAME || ''));

    case 'code_asc':
      return list.sort((a, b) => (a.MODID || '').localeCompare(b.MODID || ''));

    case 'type_lecture_first':
      return list.sort((a, b) => {
        const typeScore = (item) => {
          const text = (item.MODID + ' ' + item.MODULE_NAME).toUpperCase();
          if (text.includes('-L-') || text.includes('LECTURE')) return 1;
          if (text.includes('-T-') || text.includes('TUTORIAL')) return 2;
          return 3;
        };
        return typeScore(a) - typeScore(b);
      });

    case 'type_lab_first':
      return list.sort((a, b) => {
        const typeScore = (item) => {
          const text = (item.MODID + ' ' + item.MODULE_NAME).toUpperCase();
          if (text.includes('-LAB-') || text.includes('LAB')) return 1;
          if (text.includes('-T-') || text.includes('TUTORIAL')) return 2;
          return 3;
        };
        return typeScore(a) - typeScore(b);
      });

    case 'room_asc':
      return list.sort((a, b) => (a.ROOM || '').localeCompare(b.ROOM || '', undefined, { numeric: true }));

    case 'room_desc':
      return list.sort((a, b) => (b.ROOM || '').localeCompare(a.ROOM || '', undefined, { numeric: true }));

    default:
      return list.sort((a, b) => (a.TIME_FROM_ISO || '').localeCompare(b.TIME_FROM_ISO || ''));
  }
}
