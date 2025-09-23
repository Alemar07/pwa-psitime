
const toICSDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
};


export default function handler(request, response) {
  
  const { title, start, end, desc } = request.query;

  
  if (!title || !start) {
    response.status(400).send('Error: Faltan los parámetros "title" y "start".');
    return;
  }

  const startDate = toICSDate(start);
  
  const endDate = end ? toICSDate(end) : toICSDate(new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString());

  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MFGestorCitas//App//ES',
    'BEGIN:VEVENT',
    `UID:mf-gestor-citas-${new Date(start).getTime()}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${decodeURIComponent(title)}`,
    `DESCRIPTION:${decodeURIComponent(desc || '')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n'); 

  
  
  response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  response.setHeader('Content-Disposition', 'attachment; filename="cita.ics"');
  
  
  response.status(200).send(icsContent);
}