PWA — Pasos rápidos (GitHub Pages)

1) Coloca estos archivos en tu repositorio (en la raíz):
   - manifest.webmanifest
   - service-worker.js
   - carpeta /icons con 3 PNG (icon-192, icon-512, maskable-512)

2) Edita tu index.html:
   a) Dentro de <head> añade:
      <link rel="manifest" href="manifest.webmanifest">
      <meta name="theme-color" content="#22c55e">
      <link rel="icon" href="icons/icon-192.png" sizes="192x192">
      <link rel="apple-touch-icon" href="icons/icon-192.png">

   b) Justo antes de </body>, registra el Service Worker:
      <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./service-worker.js');
        });
      }
      </script>

   c) (Parche de bug menor) Si tu versión tenía esta línea con dos puntos:
      $('#msg')..value = buildMessage();
      cámbiala por:
      $('#msg').value = buildMessage();

3) GitHub Pages:
   - Settings → Pages → Source: rama 'main' y carpeta '/root'.
   - La URL que te dé será del tipo https://usuario.github.io/tu-repo/
   - En el manifest hemos usado start_url: "./" y scope: "./" para que funcione tanto en dominio raíz como en /tu-repo/.

4) Probar instalación:
   - Abre la URL en Chrome/Edge/Firefox (móvil o escritorio).
   - Debería aparecer "Instalar app" en la barra de direcciones o en el menú ⋮ → "Instalar".
   - iOS: usa Safari → botón de compartir → "Añadir a pantalla de inicio".

5) Offline (opcional):
   - El service worker precachea index + assets. La app seguirá abriendo sin conexión.
   - Si cambias archivos, sube los cambios y, para forzar actualización, incrementa CACHE_VERSION en service-worker.js.

6) WhatsApp:
   - El botón abre wa.me en pestaña nueva para confirmar. Automatizar envío sin intervención
     requiere WhatsApp Business API (no gratuito).

¡Listo!
