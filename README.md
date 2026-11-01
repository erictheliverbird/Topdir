# Proyector Bíblico

Aplicación web estática para controlar versículos, letras y videos durante el culto.

## Archivos principales

- `index.html`: consola de control para el operador.
- `proyector.html`: pantalla independiente para el proyector o monitor externo.
- `youtube.html`: monitor de preparación de videos de YouTube.
- `biblia.json`: Biblia completa Reina-Valera 1960 (RVR1960), cargada automáticamente y guardada también en el almacenamiento local del navegador.
- `diagnostico-captura.html`: comprueba las funciones de captura del navegador sin cambiar la proyección.
- `responsive.css`: ajustes compartidos para iPad, Safari y controles táctiles.
- `background-loop.js`: administra el fondo en dos reproductores precargados para cruzar cada ciclo con un fundido.

## Sesión, Biblia y controles

- Publica `biblia.json` junto a `index.html`. Al abrir la aplicación, la RVR1960 se carga automáticamente y se identifica en el selector de versión. No hace falta importar ese archivo en cada sesión.
- La última cita, la pestaña abierta, el formato, los fondos, el logo y la letra/estrofa activa se guardan en este navegador. Los datos permanecen en el mismo dispositivo y sitio; borrar los datos de Safari o usar otro dispositivo elimina esa copia local.
- Se pueden importar otras Biblias JSON una vez y elegirlas en el selector de versiones. Para que una versión importada también llegue a otro iPad, publica su JSON junto con los archivos de la aplicación.
- Atajos del Magic Keyboard: flechas para avanzar o retroceder versículos; en **Letras**, flechas para cambiar de estrofa; `L` pantalla de espera con logo; `B` apagar; `C` ocultar texto; `Esc` cerrar la vista ampliada.
- Para probar desde la carpeta del computador, usa GitHub Pages o un servidor local HTTPS/HTTP. Abrir `index.html` directamente como `file://` puede impedir que Safari lea automáticamente `biblia.json`.

## Animaciones y videos de diseño

- En **Diseño**, el selector ofrece fundido, deslizamiento en cuatro direcciones, zoom, desenfoque, barrido vertical o ninguna animación. El control de duración cambia la velocidad; los ajustes de fuente, color y posición no vuelven a animar el texto. Se respeta **Reducir movimiento** del dispositivo.
- **Video en bucle** permite elegir un MP4 H.264 silencioso para el fondo. Se recomienda 5–20 segundos y 720p o menos; la aplicación admite hasta 30 segundos y 30 MB. El fondo continúa durante la espera y cuando se oculta el texto; se pausa únicamente ante otros medios o apagado. Dos reproductores mantienen el mismo archivo preparado y se cruzan con un fundido de hasta 950 ms al final del ciclo, sin volver a cargar el archivo entre repeticiones. La ventana del proyector transmite el tiempo de reproducción para mantener la vista previa alineada. Los eventos de pausa, espera y fin activan reintentos incluso si Safari considera que la ventana está oculta. El bucle nativo de Safari permanece como respaldo. El fundido suaviza la unión; si los primeros fotogramas difieren mucho de los últimos, puede percibirse un cambio de imagen, por lo que conviene usar un clip diseñado para repetirse.
- La transición integrada se ejecuta al entrar o salir de YouTube o video local, y permite fundido, cortinilla, zoom o un zoom expansivo con el logo de la iglesia. El control de duración cambia la velocidad de los efectos y ajusta el clip propio entre 0.5× y 2×. Un MP4 opaco y silencioso opcional sustituye el efecto integrado; se recomienda 1–3 segundos y 720p o menos. Se admiten hasta 8 segundos y 30 MB. Si Safari bloquea el clip, se intenta el efecto elegido con un archivo integrado.
- Los archivos guardados no se sincronizan entre dispositivos ni se publican en GitHub. En cada iPad hay que seleccionarlos una vez en el mismo Safari que se usará para el culto. Si Safari impide el inicio automático del fondo, el panel muestra el estado y mantiene visible el fondo estático de respaldo.

## Preparación recomendada para iPad

1. Publica estos archivos juntos bajo una dirección HTTPS. La sincronización entre ventanas usa el canal local del navegador; la captura de pantalla requiere HTTPS.
2. Abre `index.html` en Safari y usa **Compartir → Añadir a pantalla de inicio** para tener la consola como aplicación web.
3. Antes del culto, abre **Proyectar (Ventana)** y mueve esa ventana a la pantalla externa. Mantén abiertas la consola y la proyección.
4. Confirma que la consola muestre **Proyector bíblico conectado** y prueba un versículo, el audio y cualquier video que vayas a usar.
5. Para una reproducción continua sin anuncios, prepara un archivo de video local que tengas derecho a proyectar. Cárgalo en **Video local** y pruébalo antes del servicio.
6. Abre `diagnostico-captura.html` desde la dirección HTTPS en el iPad. Pulsa **Probar selector con audio**, elige la fuente que Safari ofrezca y comparte el informe de diagnóstico. La prueba no modifica la proyección.
7. En iPad, prepara el enlace y pulsa **Proyectar video en la pantalla externa**. El video se carga directamente en la ventana del proyector. No uses captura de pantalla para el monitor: Safari en iPad puede compartir la pantalla completa y no entrega el audio del sistema. En escritorio, puedes abrir **Monitor YouTube**, capturar esa ventana y pulsar **Enviar al proyector**.

## Verificación de animaciones y fondo en Safari

Antes del culto, publica juntos `index.html`, `proyector.html`, `responsive.css` y `background-loop.js`; recarga la consola y la ventana del proyector en el mismo Safari. En **Diseño**, carga el logo y un MP4 H.264 silencioso de fondo. Déjalo reproducir al menos tres ciclos: debe cruzar el cambio de ciclo con un fundido, sin pausa de carga ni pantalla congelada; la vista previa debe seguir el tiempo del proyector. Prueba también mientras la proyección está en una ventana separada. Pulsa `C` para ocultar el texto y `L` para mostrar la espera; el fondo debe continuar en ambos estados. Al volver a Biblia o Letras, el texto/estrofa debe usar la animación elegida. Cambiar fuente o color no debe volver a iniciar esa animación. Selecciona varios degradados y verifica que el fondo siga visible tanto en el proyector como en la vista previa.

Después abre un video local, cambia un versículo o una estrofa y confirma que el video sigue en el mismo tiempo. Al salir del video, el fondo debe volver a reproducirse. Cambiar entre texto y video debe mostrar la transición elegida; con **Zoom con logo de la iglesia**, el logo debe cubrir la pantalla y revelar el nuevo contenido. Si algo falla, anota el modelo del iPad, la versión de iPadOS, el formato/duración del MP4 y el estado que muestra el centro multimedia.

## YouTube y anuncios

YouTube decide si el reproductor muestra anuncios. Su reproductor incrustado no tiene un parámetro oficial para desactivarlos. La pantalla de proyección conserva los controles oficiales para que el operador pueda usar **Saltar anuncio** cuando YouTube habilite esa opción. Safari también puede exigir un toque en el propio reproductor para empezar la reproducción con sonido.

La aplicación usa un solo reproductor en `proyector.html` y no cambia sus parámetros cuando Safari separa esa pestaña en otra ventana. Si el video en curso conserva su tiempo al separar la pestaña, el reproductor no se reinició. Los anuncios que aparecen al cargar el siguiente video los decide YouTube para esa solicitud; comparar videos distintos no permite atribuir el cambio solamente a la ventana. No existe un ajuste soportado en esta aplicación para forzar la ausencia de anuncios. Si tienes YouTube Premium, verifica que Safari no esté usando una ventana privada y que las cookies de YouTube no estén bloqueadas para el reproductor incrustado.

La recomendación oficial de YouTube para un video incrustado que todavía muestra anuncios con Premium es revisar que no se estén bloqueando sus cookies. Safari también aísla el estado por pestaña durante la navegación privada, así que conviene comprobar que ambas páginas estén en la misma sesión normal antes de comparar el resultado.

Para usar YouTube, pega un enlace válido y pulsa **Preparar**. En iPad, pulsa **Proyectar video en la pantalla externa** para enviar el reproductor directamente a la ventana local. En escritorio, abre **Monitor YouTube**, revisa el video, captura esa ventana y confirma con **Enviar al proyector**. Los controles oficiales de reproducción, pausa y avance siguen disponibles.

La captura web requiere HTTPS y un clic directo del operador para abrir el selector nativo. La lista de fuentes y la captura de audio dependen de Safari/iPadOS. La captura transmite lo que YouTube muestra, incluidos anuncios; la proyección directa de YouTube tampoco los elimina. Para una reproducción garantizada sin anuncios, usa un video local con permiso de reproducción.

## Conectividad

La consola y el proyector se sincronizan por `BroadcastChannel` en el mismo navegador. Los videos locales se envían por ese canal en bloques confirmados y la vista previa también usa el canal local; WebRTC queda para la captura de pantalla. La aplicación no carga Firebase ni necesita una sala remota. Mantén las ventanas de control y proyección abiertas en el mismo navegador y sitio. Tailwind CSS, Font Awesome, Google Fonts y el reproductor de YouTube se cargan desde sus servicios oficiales y requieren Internet. Safari/iPadOS puede limitar la captura de pantalla o el audio compartido; ensaya ese flujo en el mismo iPad antes del culto.
