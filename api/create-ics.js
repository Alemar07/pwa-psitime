// api/create-ics.js

// Helper para formatear la fecha al estándar de iCalendar (YYYYMMDDTHHMMSSZ)
const toICSDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
};

// La función principal que se ejecutará
export default function handler(request, response) {
  // Leemos los datos de la cita desde los parámetros de la URL
  const { title, start, end, desc } = request.query;

  // Validaciones básicas
  if (!title || !start) {
    response.status(400).send('Error: Faltan los parámetros "title" y "start".');
    return;
  }

  const startDate = toICSDate(start);
  // Si no hay fecha de fin, se asume una duración de 1 hora
  const endDate = end ? toICSDate(end) : toICSDate(new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString());

  // Construimos el contenido del archivo .ics
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
  ].join('\r\n'); // Usamos \r\n para máxima compatibilidad

  // Configuramos las cabeceras de la respuesta para que el navegador
  // sepa que es un archivo de calendario y lo trate como tal.
  response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  response.setHeader('Content-Disposition', 'attachment; filename="cita.ics"');
  
  // Enviamos el contenido del archivo .ics como respuesta
  response.status(200).send(icsContent);
}