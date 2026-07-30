# Sistema de Traducción Multiidioma

Sistema completo de internacionalización (i18n) para el Hotel Sebastian con soporte para 5 idiomas.

## 🌐 Idiomas Soportados

- **Español (ES)** 🇪🇸 - Idioma predeterminado
- **Inglés (EN)** 🇺🇸
- **Francés (FR)** 🇫🇷
- **Coreano (KO)** 🇰🇷
- **Chino (ZH)** 🇨🇳

## 📁 Estructura de Archivos

```
frontend/src/app/
├── services/
│   └── translate.service.ts          # Servicio principal de traducción
├── config/
│   └── translations/
│       ├── es.ts                      # Traducciones en español
│       ├── en.ts                      # Traducciones en inglés
│       ├── fr.ts                      # Traducciones en francés
│       ├── ko.ts                      # Traducciones en coreano
│       ├── zh.ts                      # Traducciones en chino
│       └── index.ts                   # Exportador de traducciones
├── components/
│   └── language-selector/             # Selector de idiomas
│       ├── language-selector.ts
│       ├── language-selector.html
│       └── language-selector.css
└── shared/
    ├── translate.pipe.ts              # Pipe para traducciones
    └── click-outside.directive.ts     # Directiva auxiliar
```

## 🚀 Uso del Sistema de Traducción

### 1. En Templates HTML (usando Pipe)

```html
<!-- Uso básico -->
<h1>{{ 'nav.home' | translate }}</h1>
<p>{{ 'home.subtitle' | translate }}</p>

<!-- En atributos -->
<button [title]="'common.save' | translate">
  {{ 'common.save' | translate }}
</button>
```

### 2. En Componentes TypeScript

```typescript
import { TranslateService } from '../../services/translate.service';

export class MiComponente {
  constructor(private translateService: TranslateService) {}

  obtenerTexto(): string {
    return this.translateService.translate('nav.home');
    // o usando el método abreviado:
    return this.translateService.t('nav.home');
  }

  cambiarIdioma(): void {
    this.translateService.setLanguage('en');
  }

  obtenerIdiomaActual(): Language {
    return this.translateService.getCurrentLanguage();
  }
}
```

### 3. Selector de Idiomas

El selector ya está integrado en el navbar. Para agregarlo en otro componente:

```html
<app-language-selector></app-language-selector>
```

## 📝 Agregar Nuevas Traducciones

### 1. Agregar nuevas claves en cada archivo de idioma:

**es.ts:**
```typescript
export const es = {
  nav: {
    home: 'Inicio',
    // ... más traducciones
  },
  nuevaSeccion: {
    titulo: 'Nuevo Título',
    descripcion: 'Nueva Descripción'
  }
};
```

**en.ts:**
```typescript
export const en = {
  nav: {
    home: 'Home',
    // ... más traducciones
  },
  nuevaSeccion: {
    titulo: 'New Title',
    descripcion: 'New Description'
  }
};
```

Repetir para fr.ts, ko.ts, zh.ts

### 2. Usar en templates:

```html
<h2>{{ 'nuevaSeccion.titulo' | translate }}</h2>
<p>{{ 'nuevaSeccion.descripcion' | translate }}</p>
```

## 🎨 Integrar en Nuevos Componentes

### 1. Importar la Pipe:

```typescript
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-mi-componente',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './mi-componente.html',
  styleUrl: './mi-componente.css',
})
export class MiComponente { }
```

### 2. Usar en el template:

```html
<h1>{{ 'miSeccion.titulo' | translate }}</h1>
```

## 🔄 Agregar un Nuevo Idioma

### Paso 1: Crear archivo de traducción

Crear `frontend/src/app/config/translations/ja.ts`:

```typescript
export const ja = {
  nav: {
    home: 'ホーム',
    rooms: '部屋',
    // ... más traducciones
  },
  // ... copiar estructura de es.ts y traducir
};
```

### Paso 2: Actualizar index.ts

```typescript
export { es } from './es';
export { en } from './en';
export { fr } from './fr';
export { ko } from './ko';
export { zh } from './zh';
export { ja } from './ja';  // ← Agregar
```

### Paso 3: Actualizar TranslateService

En `translate.service.ts`:

```typescript
export type Language = 'es' | 'en' | 'fr' | 'ko' | 'zh' | 'ja';  // ← Agregar 'ja'
```

### Paso 4: Registrar en app.config.ts

```typescript
import { es, en, fr, ko, zh, ja } from './config/translations';

export function initializeTranslations(translateService: TranslateService) {
  return () => {
    translateService.setTranslations('es', es);
    translateService.setTranslations('en', en);
    translateService.setTranslations('fr', fr);
    translateService.setTranslations('ko', ko);
    translateService.setTranslations('zh', zh);
    translateService.setTranslations('ja', ja);  // ← Agregar
  };
}
```

### Paso 5: Agregar al selector

En `language-selector.ts`:

```typescript
languages: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }  // ← Agregar
];
```

## 💾 Persistencia

El idioma seleccionado se guarda automáticamente en `localStorage` y se restaura al recargar la página.

## 🎯 Características

- ✅ 5 idiomas soportados
- ✅ Selector visual con banderas
- ✅ Persistencia en localStorage
- ✅ Cambio de idioma en tiempo real
- ✅ Pipe para usar en templates
- ✅ Servicio para usar en componentes
- ✅ Completamente tipado con TypeScript
- ✅ Responsive y mobile-friendly

## 📋 Ejemplo Completo

```typescript
// mi-componente.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-mi-componente',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './mi-componente.html',
  styleUrl: './mi-componente.css',
})
export class MiComponente implements OnInit {
  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    console.log('Idioma actual:', this.translateService.getCurrentLanguage());
  }

  cambiarAIngles(): void {
    this.translateService.setLanguage('en');
  }
}
```

```html
<!-- mi-componente.html -->
<div class="mi-componente">
  <h1>{{ 'home.title' | translate }}</h1>
  <p>{{ 'home.subtitle' | translate }}</p>
  
  <button (click)="cambiarAIngles()">
    {{ 'common.changeLanguage' | translate }}
  </button>
  
  <app-language-selector></app-language-selector>
</div>
```

## 🛠️ Mantenimiento

Al agregar nuevas funcionalidades:

1. Agregar las claves de traducción en **todos** los archivos de idioma
2. Mantener la misma estructura en todos los archivos
3. Usar nombres descriptivos para las claves
4. Agrupar traducciones relacionadas bajo el mismo objeto

## ⚡ Performance

- Las traducciones se cargan una sola vez al iniciar la aplicación
- El cambio de idioma es instantáneo (sin recarga de página)
- La pipe es impura para detectar cambios de idioma en tiempo real
