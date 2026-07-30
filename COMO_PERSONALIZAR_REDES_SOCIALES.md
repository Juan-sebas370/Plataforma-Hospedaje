# 🌐 Cómo Personalizar las Redes Sociales del Footer

Las redes sociales han sido agregadas al footer de todas las páginas. Para personalizarlas con tus enlaces reales, sigue estos pasos:

## Ubicación del archivo:
`frontend/src/app/components/footer/footer.html`

## Redes sociales incluidas:

### 1. 📘 Facebook
```html
<a href="https://facebook.com/hospedjesebastian" target="_blank" class="social-link facebook">
```
**Cambiar por:** Tu página de Facebook
Ejemplo: `https://facebook.com/TuHotel`

### 2. 📸 Instagram
```html
<a href="https://instagram.com/hospedjesebastian" target="_blank" class="social-link instagram">
```
**Cambiar por:** Tu perfil de Instagram
Ejemplo: `https://instagram.com/tuhotel`

### 3. 🐦 Twitter/X
```html
<a href="https://twitter.com/hospedjesebastian" target="_blank" class="social-link twitter">
```
**Cambiar por:** Tu perfil de Twitter
Ejemplo: `https://twitter.com/tuhotel`

### 4. 💬 WhatsApp
```html
<a href="https://wa.me/573001234567" target="_blank" class="social-link whatsapp">
```
**Cambiar por:** Tu número de WhatsApp (con código de país sin +)
Ejemplo: `https://wa.me/573001234567` (Colombia)
Ejemplo: `https://wa.me/5491112345678` (Argentina)

### 5. 📹 YouTube
```html
<a href="https://youtube.com/@hospedjesebastian" target="_blank" class="social-link youtube">
```
**Cambiar por:** Tu canal de YouTube
Ejemplo: `https://youtube.com/@tuhotel`

### 6. 🎵 TikTok
```html
<a href="https://tiktok.com/@hospedjesebastian" target="_blank" class="social-link tiktok">
```
**Cambiar por:** Tu perfil de TikTok
Ejemplo: `https://tiktok.com/@tuhotel`

## Eliminar redes sociales no utilizadas

Si no usas alguna red social, simplemente elimina el bloque `<a>...</a>` correspondiente.

## Agregar más redes sociales

Si quieres agregar LinkedIn, Pinterest u otra red:

1. Busca el ícono SVG en [simpleicons.org](https://simpleicons.org/)
2. Copia el código SVG
3. Agrega un nuevo enlace usando la misma estructura
4. Agrega el estilo hover en `footer.css`:

```css
.social-link.linkedin:hover {
  background: #0077b5;
}
```

## Colores de las redes (configurados en CSS)

- Facebook: `#1877f2`
- Instagram: Degradado multicolor
- Twitter/X: `#000000`
- WhatsApp: `#25d366`
- YouTube: `#ff0000`
- TikTok: `#000000`

Los íconos cambian de color al pasar el mouse sobre ellos.
