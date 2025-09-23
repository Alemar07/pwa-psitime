// api/c/[data].js

import pako from 'pako';
import { generateICSContent, generateHTMLPage } from '../../_lib/calendar-helpers.js';

export default function handler(request, response) {
  const { data, action } = request.query;
  if (!data) {
    return response.status(400).send('Falta el código de la cita.');
  }

  try {
    // 1. Decodificamos el código de Base64URL a Base64 estándar.
    let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // --- CAMBIO CLAVE Y DEFINITIVO ---
    // 2. Usamos Buffer para decodificar de Base64 a datos binarios.
    // Este método es robusto y estándar en el servidor.
    const compressed = Buffer.from(base64, 'base64');

    // 3. Descomprimimos para obtener el string JSON original.
    const jsonString = pako.inflate(compressed, { to: 'string' });
    const eventData = JSON.parse(jsonString);
    
    // El resto de la lógica se mantiene igual...
    const queryForICS = {
      title: encodeURIComponent(eventData.title),
      start: new Date(eventData.start).toISOString(),
      end: eventData.end ? new Date(eventData.end).toISOString() : null,
      desc: encodeURIComponent(eventData.desc),
    };
    
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