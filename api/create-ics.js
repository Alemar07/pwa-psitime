// api/create-ics.js

// Helper para generar el contenido del archivo .ics
const generateICSContent = (query) => {
  const { title, start, end, desc } = query;
  
  const toICSDate = (dateStr) => new Date(dateStr).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const startDate = toICSDate(start);
  const endDate = end ? toICSDate(end) : toICSDate(new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString());

  return [
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
};

// La función principal que se ejecutará
export default function handler(request, response) {
  const { title, start } = request.query;

  if (!title || !start) {
    return response.status(400).send('Error: Faltan parámetros esenciales.');
  }

  // 1. Generamos el contenido del calendario
  const icsContent = generateICSContent(request.query);
  
  // 2. Creamos un "data URI", que es un enlace que contiene el propio archivo
  const dataUri = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  // 3. Redirigimos al usuario a ese data URI. Esta es la clave.
  response.setHeader('Location', dataUri);
  response.status(302).end(); // 302 es el código para una redirección temporal
}