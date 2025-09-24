// _lib/calendar-helpers.js

// Esta función genera el contenido del archivo .ics
export const generateICSContent = (query) => {
  const { title, start, end, desc } = query;
  const toICSDate = (dateStr) => new Date(dateStr).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const startDate = toICSDate(start);
  const endDate = end ? toICSDate(end) : toICSDate(new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString());

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MFGestorCitas//App//ES', 'BEGIN:VEVENT',
    `UID:mf-gestor-citas-${new Date(start).getTime()}`, `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${startDate}`, `DTEND:${endDate}`, `SUMMARY:${decodeURIComponent(title)}`,
    `DESCRIPTION:${decodeURIComponent(desc || '')}`, 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
};

// Esta función genera la página HTML intermedia
export const generateHTMLPage = (query, downloadUrl) => {
    const { title, start } = query;
    const decodedTitle = decodeURIComponent(title);
    const eventDate = new Date(start).toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Añadir Cita al Calendario</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: grid; place-content: center; min-height: 100vh; text-align: center; background: #f4f4f9; color: #333; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 400px; }
          h1 { font-size: 24px; margin-top: 0; }
          p { margin-bottom: 24px; color: #555; line-height: 1.5; }
          a { display: inline-block; text-decoration: none; background: #007aff; color: white; padding: 16px 24px; border-radius: 12px; font-weight: bold; font-size: 18px; transition: transform 0.2s; }
          a:active { transform: scale(0.96); }
          .help-text { font-size: 12px; color: #888; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${decodedTitle}</h1>
          <p>${eventDate}</p>
          <a href="${downloadUrl}" download="cita.ics">Añadir a mi Calendario</a>
          <p class="help-text">Si la descarga no funciona, copia el enlace y ábrelo en Safari o en Chrome.</p>
        </div>
      </body>
      </html>
    `;
};