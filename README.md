# Proyector Bíblico

Aplicación web estática para controlar versículos, letras y videos durante el culto.

## Archivos principales

- `index.html`: consola de control para el operador.
- `proyector.html`: pantalla independiente para el proyector o monitor externo.
- `youtube.html`: monitor de preparación de videos de YouTube.
- `responsive.css`: ajustes compartidos para iPad, Safari y controles táctiles.

## Preparación recomendada para iPad

1. Publica estos archivos juntos bajo una dirección HTTPS. La sincronización remota y algunas funciones de pantalla necesitan una conexión segura.
2. Abre `index.html` en Safari y usa **Compartir → Añadir a pantalla de inicio** para tener la consola como aplicación web.
3. Antes del culto, abre **Proyectar (Ventana)** y mueve esa ventana a la pantalla externa. Mantén abiertas la consola y la proyección.
4. Confirma que la consola muestre **Proyector bíblico conectado** y prueba un versículo, el audio y cualquier video que vayas a usar.
5. Para una reproducción continua sin anuncios, prepara un archivo de video local que tengas derecho a proyectar. Cárgalo en **Video local** y pruébalo antes del servicio.

## YouTube y anuncios

YouTube decide si el reproductor muestra anuncios. Su reproductor incrustado no tiene un parámetro oficial para desactivarlos. La pantalla de proyección conserva los controles oficiales para que el operador pueda usar **Saltar anuncio** cuando YouTube habilite esa opción. Safari también puede exigir un toque en el propio reproductor para empezar la reproducción con sonido.

Para usar YouTube, pega un enlace válido y pulsa **Preparar**. Esto no cambia la proyección actual. Cuando estés listo, pulsa **Enviar video a proyección** y después **Reproducir YouTube**. El monitor separado permite revisar el video, pero es una reproducción aparte; iniciar después otra reproducción en la pantalla puede volver a activar anuncios.

## Conectividad

La aplicación carga Firebase, Tailwind CSS, iconos, tipografías y YouTube desde sus servicios oficiales. Las funciones que dependen de esos servicios requieren Internet. Si la sincronización remota falla, deja ambas ventanas abiertas y revisa el aviso de conexión en la consola. La aplicación no incluye almacenamiento sin conexión de esas dependencias.
