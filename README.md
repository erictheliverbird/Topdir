# Proyector Bíblico

Aplicación web estática para controlar versículos, letras y videos durante el culto.

## Archivos principales

- `index.html`: consola de control para el operador.
- `proyector.html`: pantalla independiente para el proyector o monitor externo.
- `youtube.html`: monitor de preparación de videos de YouTube.
- `biblia.json`: Biblia completa Reina-Valera 1960 (RVR1960), cargada automáticamente y guardada también en el almacenamiento local del navegador.
- `diagnostico-captura.html`: comprueba las funciones de captura del navegador sin cambiar la proyección.
- `responsive.css`: ajustes compartidos para iPad, Safari y controles táctiles.

## Sesión, Biblia y controles

- Publica `biblia.json` junto a `index.html`. Al abrir la aplicación, la RVR1960 se carga automáticamente y se identifica en el selector de versión. No hace falta importar ese archivo en cada sesión.
- La última cita, la pestaña abierta, el formato, los fondos, el logo y la letra/estrofa activa se guardan en este navegador. Los datos permanecen en el mismo dispositivo y sitio; borrar los datos de Safari o usar otro dispositivo elimina esa copia local.
- Se pueden importar otras Biblias JSON una vez y elegirlas en el selector de versiones. Para que una versión importada también llegue a otro iPad, publica su JSON junto con los archivos de la aplicación.
- Atajos del Magic Keyboard: flechas para avanzar o retroceder versículos; en **Letras**, flechas para cambiar de estrofa; `L` pantalla de espera con logo; `B` apagar; `C` ocultar texto; `Esc` cerrar la vista ampliada.
- Para probar desde la carpeta del computador, usa GitHub Pages o un servidor local HTTPS/HTTP. Abrir `index.html` directamente como `file://` puede impedir que Safari lea automáticamente `biblia.json`.

## Preparación recomendada para iPad

1. Publica estos archivos juntos bajo una dirección HTTPS. La sincronización entre ventanas usa el canal local del navegador; la captura de pantalla requiere HTTPS.
2. Abre `index.html` en Safari y usa **Compartir → Añadir a pantalla de inicio** para tener la consola como aplicación web.
3. Antes del culto, abre **Proyectar (Ventana)** y mueve esa ventana a la pantalla externa. Mantén abiertas la consola y la proyección.
4. Confirma que la consola muestre **Proyector bíblico conectado** y prueba un versículo, el audio y cualquier video que vayas a usar.
5. Para una reproducción continua sin anuncios, prepara un archivo de video local que tengas derecho a proyectar. Cárgalo en **Video local** y pruébalo antes del servicio.
6. Abre `diagnostico-captura.html` desde la dirección HTTPS en el iPad. Pulsa **Probar selector con audio**, elige la fuente que Safari ofrezca y comparte el informe de diagnóstico. La prueba no modifica la proyección.
7. En iPad, prepara el enlace y pulsa **Proyectar video en la pantalla externa**. El video se carga directamente en la ventana del proyector. No uses captura de pantalla para el monitor: Safari en iPad puede compartir la pantalla completa y no entrega el audio del sistema. En escritorio, puedes abrir **Monitor YouTube**, capturar esa ventana y pulsar **Enviar al proyector**.

## YouTube y anuncios

YouTube decide si el reproductor muestra anuncios. Su reproductor incrustado no tiene un parámetro oficial para desactivarlos. La pantalla de proyección conserva los controles oficiales para que el operador pueda usar **Saltar anuncio** cuando YouTube habilite esa opción. Safari también puede exigir un toque en el propio reproductor para empezar la reproducción con sonido.

La aplicación usa un solo reproductor en `proyector.html` y no cambia sus parámetros cuando Safari separa esa pestaña en otra ventana. Si el video en curso conserva su tiempo al separar la pestaña, el reproductor no se reinició. Los anuncios que aparecen al cargar el siguiente video los decide YouTube para esa solicitud; comparar videos distintos no permite atribuir el cambio solamente a la ventana. No existe un ajuste soportado en esta aplicación para forzar la ausencia de anuncios. Si tienes YouTube Premium, verifica que Safari no esté usando una ventana privada y que las cookies de YouTube no estén bloqueadas para el reproductor incrustado.

La recomendación oficial de YouTube para un video incrustado que todavía muestra anuncios con Premium es revisar que no se estén bloqueando sus cookies. Safari también aísla el estado por pestaña durante la navegación privada, así que conviene comprobar que ambas páginas estén en la misma sesión normal antes de comparar el resultado.

Para usar YouTube, pega un enlace válido y pulsa **Preparar**. En iPad, pulsa **Proyectar video en la pantalla externa** para enviar el reproductor directamente a la ventana local. En escritorio, abre **Monitor YouTube**, revisa el video, captura esa ventana y confirma con **Enviar al proyector**. Los controles oficiales de reproducción, pausa y avance siguen disponibles.

La captura web requiere HTTPS y un clic directo del operador para abrir el selector nativo. La lista de fuentes y la captura de audio dependen de Safari/iPadOS. La captura transmite lo que YouTube muestra, incluidos anuncios; la proyección directa de YouTube tampoco los elimina. Para una reproducción garantizada sin anuncios, usa un video local con permiso de reproducción.

## Conectividad

La consola y el proyector se sincronizan por `BroadcastChannel` en el mismo navegador. Los videos locales se envían por ese canal en bloques confirmados y la vista previa también usa el canal local; WebRTC queda para la captura de pantalla. La aplicación no carga Firebase ni necesita una sala remota. Mantén las ventanas de control y proyección abiertas en el mismo navegador y sitio. Tailwind CSS, Font Awesome, Google Fonts y el reproductor de YouTube se cargan desde sus servicios oficiales y requieren Internet. Safari/iPadOS puede limitar la captura de pantalla o el audio compartido; ensaya ese flujo en el mismo iPad antes del culto.
