/**
 * Generates an iCalendar (.ics) string for a list of classes
 * and triggers a browser download.
 */

// Helper to format ISO date string or Date to UTC ICS format YYYYMMDDTHHmmssZ
function formatICSDate(isoString) {
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

// Generate Google Calendar direct URL
export function getGoogleCalendarUrl(cls) {
  const startIso = cls.TIME_FROM_ISO;
  const endIso = cls.TIME_TO_ISO;
  const title = encodeURIComponent(`${cls.MODULE_NAME} (${cls.MODID})`);
  const details = encodeURIComponent(
    `Lecturer: ${cls.NAME || 'N/A'}\nIntake: ${cls.INTAKE}\nGrouping: ${cls.GROUPING || 'All'}\nClass Code: ${cls.CLASS_CODE || ''}`
  );
  const location = encodeURIComponent(`${cls.ROOM || 'TBA'}, ${cls.LOCATION || 'APU'}`);

  const startTime = formatICSDate(startIso);
  const endTime = formatICSDate(endIso);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
}

// Generate and trigger download of .ics file
export function exportToICS(classes, filename = 'timetable.ics') {
  if (!classes || classes.length === 0) return;

  const now = formatICSDate(new Date().toISOString());

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//APU Timetable//Material You//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Class Timetable',
    'X-WR-TIMEZONE:Asia/Kuala_Lumpur'
  ];

  classes.forEach((cls, idx) => {
    if (!cls.TIME_FROM_ISO || !cls.TIME_TO_ISO) return;

    const start = formatICSDate(cls.TIME_FROM_ISO);
    const end = formatICSDate(cls.TIME_TO_ISO);
    const uid = `${cls.CLASS_CODE || 'class'}-${cls.DATESTAMP_ISO || idx}-${idx}@apu.edu.my`;
    const summary = `${cls.MODULE_NAME} (${cls.MODID})`;
    const description = `Lecturer: ${cls.NAME || 'N/A'}\\nIntake: ${cls.INTAKE}\\nGrouping: ${cls.GROUPING || 'All'}\\nRoom: ${cls.ROOM}`;
    const location = `${cls.ROOM || ''} ${cls.LOCATION || 'APU'}`.trim();

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
