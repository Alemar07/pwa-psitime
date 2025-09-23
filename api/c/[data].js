// api/c/[data].js

import pako from 'pako'; // Vercel instalará esto automáticamente
import { generateICSContent, generateHTMLPage } from '../../_lib/calendar-helpers.js';

export default function handler(request, response) {
  // 1. Obtenemos el código comprimido de la URL.
  const { data } = request.query;
  if (!data) {
    return response.status(400).send('Falta el código de la cita.');
  }

  try {
    // 2. Decodificamos el código de Base64URL a su formato original.
    let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const compressed = atob(base64);

    // 3. Descomprimimos para obtener el string JSON original.
    const jsonString = pako.inflate(compressed, { to: 'string' });
    const eventData = JSON.parse(jsonString);

    // 4. Convertimos los timestamps de vuelta a formato de fecha ISO.
    const queryForICS = {
      title: encodeURIComponent(eventData.title),
      start: new Date(eventData.start).toISOString(),
      end: eventData.end ? new Date(eventData.end).toISOString() : null,
      desc: encodeURIComponent(eventData.desc),
    };
    
    const { action } = request.query;

    // 5. Reutilizamos la lógica que ya funciona.
    if (action === 'download') {
      const icsContent = generateICSContent(queryForICS);
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader('Content-Disposition', 'attachment; filename="cita.ics"');
      return response.status(200).send(icsContent);
    } else {
      const downloadUrl = `${request.url}${request.url.includes('?') ? '&' : '?'}action=download`;
      const html = generateHTMLPage(queryForICS, downloadUrl);
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      return response.status(200).send(html);
    }

  } catch (error) {
    console.error("Error decoding event data:", error);
    return response.status(500).send('El enlace de la cita no es válido o está corrupto.');
  }
}