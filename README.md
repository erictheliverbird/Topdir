# Proyector Bíblico

Aplicación web estática para controlar versículos, letras y videos durante el culto.

## Archivos principales

- `index.html`: consola de control para el operador.
- `proyector.html`: pantalla independiente para el proyector o monitor externo.
- `youtube.html`: monitor de preparación de videos de YouTube.
- `diagnostico-captura.html`: comprueba las funciones de captura del navegador sin cambiar la proyección.
- `responsive.css`: ajustes compartidos para iPad, Safari y controles táctiles.

## Preparación recomendada para iPad

1. Publica estos archivos juntos bajo una dirección HTTPS. La sincronización entre ventanas usa el canal local del navegador; la captura de pantalla requiere HTTPS.
2. Abre `index.html` en Safari y usa **Compartir → Añadir a pantalla de inicio** para tener la consola como aplicación web.
3. Antes del culto, abre **Proyectar (Ventana)** y mueve esa ventana a la pantalla externa. Mantén abiertas la consola y la proyección.
4. Confirma que la consola muestre **Proyector bíblico conectado** y prueba un versículo, el audio y cualquier video que vayas a usar.
5. Para una reproducción continua sin anuncios, prepara un archivo de video local que tengas derecho a proyectar. Cárgalo en **Video local** y pruébalo antes del servicio.
6. Abre `diagnostico-captura.html` desde la dirección HTTPS en el iPad. Pulsa **Probar selector con audio**, elige la fuente que Safari ofrezca y comparte el informe de diagnóstico. La prueba no modifica la proyección.
7. Después ensaya **Capturar ventana del monitor** y **Enviar al proyector** con la misma configuración de pantalla que usarás durante el culto. Según la versión de iPadOS, Safari puede ofrecer solo la pantalla completa; en ese caso elige únicamente una pantalla dedicada al monitor.

## YouTube y anuncios

YouTube decide si el reproductor muestra anuncios. Su reproductor incrustado no tiene un parámetro oficial para desactivarlos. La pantalla de proyección conserva los controles oficiales para que el operador pueda usar **Saltar anuncio** cuando YouTube habilite esa opción. Safari también puede exigir un toque en el propio reproductor para empezar la reproducción con sonido.

Para usar YouTube, pega un enlace válido y pulsa **Preparar**. Esto no cambia la proyección actual. Abre **Monitor YouTube**, reproduce y revisa el video allí y salta cualquier anuncio cuando YouTube ofrezca esa opción. Cuando la fuente esté lista, pulsa **Capturar ventana del monitor** y selecciona **Monitor YouTube** en el selector del navegador. La captura queda preparada, mientras la proyección actual sigue en pantalla. Revisa la fuente seleccionada y pulsa **Enviar al proyector** cuando decidas salir en vivo. El proyector cambia solo después de confirmar la conexión WebRTC y recibe la misma reproducción, sin cargar otro reproductor ni reiniciar su posición. Los controles de reproducción, pausa y avance siguen actuando sobre el monitor. Usa **Cancelar captura / detener proyección** para cancelar una fuente preparada o volver al contenido anterior.

La captura web requiere HTTPS y un clic directo del operador para abrir el selector nativo. La lista de fuentes, la captura de audio y la posibilidad de compartir una ventana o pestaña dependen de Safari/iPadOS. Si el selector solo ofrece **pantalla completa**, esa fuente puede incluir todo lo visible en esa pantalla; úsala únicamente si es la pantalla dedicada al monitor. Si Safari rechaza el audio, la consola permite volver a pulsar para transmitir solo el video. Si el navegador no ofrece captura de pantalla, la consola lo indicará y no iniciará una reproducción alternativa. La captura transmite exactamente lo que YouTube muestra, incluidos anuncios que aparezcan durante la emisión; para una reproducción garantizada sin anuncios, usa un video local con permiso de reproducción.

## Conectividad

La sincronización de la consola con el proyector usa `BroadcastChannel` en el mismo navegador y la transferencia de medios usa WebRTC; la aplicación ya no carga Firebase ni necesita una sala remota. Mantén las ventanas de control y proyección abiertas en el mismo navegador y sitio. Tailwind CSS, Font Awesome, Google Fonts y el reproductor de YouTube se cargan desde sus servicios oficiales y requieren Internet. Safari/iPadOS puede limitar la captura de pantalla, el audio compartido o el establecimiento de una conexión WebRTC; usa el diagnóstico y ensaya el flujo en el mismo iPad antes del culto.
