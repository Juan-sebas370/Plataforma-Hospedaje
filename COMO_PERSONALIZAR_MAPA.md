# 🗺️ Cómo Personalizar el Mapa de Google Maps

El mapa interactivo ha sido agregado a la página de contacto. Para personalizarlo con la ubicación real del hotel, sigue estos pasos:

## Paso 1: Obtener el Código de Inserción

1. Ve a [Google Maps](https://www.google.com/maps)
2. Busca la dirección exacta de tu hotel
3. Haz clic en el botón **"Compartir"**
4. Selecciona la pestaña **"Incorporar un mapa"**
5. Copia el código que aparece (es un iframe)

## Paso 2: Actualizar el Código

Abre el archivo: `frontend/src/app/components/contacto/contacto.html`

Busca la línea que contiene:
```html
<iframe 
  class="google-map"
  src="https://www.google.com/maps/embed?pb=!1m18..."
```

Reemplaza solo el valor de `src=""` con la URL que copiaste de Google Maps.

## Ejemplo:

**Antes:**
```html
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976..."
```

**Después (con tu ubicación real):**
```html
src="https://www.google.com/maps/embed?pb=TU_CODIGO_AQUI"
```

## Paso 3: Personalizar el Enlace "Ver en Google Maps"

En el mismo archivo, busca:
```html
<a href="https://www.google.com/maps/search/Hotel+Sebastian+Bogota" target="_blank">
```

Cambia el enlace por la URL directa a tu negocio en Google Maps:
```html
<a href="https://goo.gl/maps/TU_CODIGO_CORTO" target="_blank">
```

## Ajustar el Tamaño del Mapa

Si quieres cambiar la altura del mapa, edita `frontend/src/app/components/contacto/contacto.css`:

```css
.google-map {
  width: 100%;
  height: 400px;  /* Cambia este valor */
  border: none;
  display: block;
}
```

---

**Nota:** El mapa actual muestra Bogotá, Colombia como ubicación de ejemplo. ¡No olvides actualizarlo con tu ubicación real!
