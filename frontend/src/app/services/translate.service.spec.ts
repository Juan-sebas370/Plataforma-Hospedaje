import { TestBed } from '@angular/core/testing';
import { TranslateService } from './translate.service';
import { paginas as paginasEs } from '../config/translations/paginas/es';
import { paginas as paginasEn } from '../config/translations/paginas/en';
import { paginas as paginasFr } from '../config/translations/paginas/fr';
import { paginas as paginasPt } from '../config/translations/paginas/pt';
import { paginas as paginasKo } from '../config/translations/paginas/ko';
import { paginas as paginasZh } from '../config/translations/paginas/zh';
import { Translation } from './translate.service';

/** Claves "a.b.c" de un diccionario. */
function claves(t: Translation, prefijo = ''): string[] {
  return Object.entries(t).flatMap(([k, v]) => (typeof v === 'string' ? [prefijo + k] : claves(v, `${prefijo}${k}.`)));
}

describe('TranslateService', () => {
  let service: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslateService);
    service.setTranslations('es', { saludo: 'Hola {nombre}', solo: { es: 'Solo en español' } });
  });

  afterEach(() => localStorage.clear());

  it('reemplaza los parámetros {nombre} del texto', () => {
    expect(service.translate('saludo', { nombre: 'Ana' })).toBe('Hola Ana');
  });

  it('deja intacto un parámetro que no se pasó', () => {
    expect(service.translate('saludo', { otro: 1 })).toBe('Hola {nombre}');
  });

  it('si falta en el idioma elegido usa el español; si no existe devuelve la clave', async () => {
    service.setTranslations('en', { saludo: 'Hello {nombre}' });
    await service.setLanguage('en');
    expect(service.translate('saludo', { nombre: 'Ann' })).toBe('Hello Ann');
    expect(service.translate('solo.es')).toBe('Solo en español');
    expect(service.translate('no.existe')).toBe('no.existe');
  });

  it('descarga un idioma la primera vez que se elige', async () => {
    let descargas = 0;
    service.setLoader('fr', async () => { descargas++; return { saludo: 'Bonjour {nombre}' }; });

    await service.setLanguage('fr');
    await service.setLanguage('fr');

    expect(descargas).toBe(1);
    expect(service.getCurrentLanguage()).toBe('fr');
    expect(service.translate('saludo', { nombre: 'Luc' })).toBe('Bonjour Luc');
    expect(localStorage.getItem('selectedLanguage')).toBe('fr');
  });

  it('las páginas tienen las mismas claves en los 6 idiomas (salvo los datos que en español usan el original)', () => {
    const datos = /^(cuartos|servicioHab|lugar)\./;
    const es = claves(paginasEs).sort();
    for (const [idioma, dic] of Object.entries({ en: paginasEn, fr: paginasFr, pt: paginasPt, ko: paginasKo, zh: paginasZh })) {
      const otras = claves(dic).filter(k => !datos.test(k)).sort();
      expect({ idioma, claves: otras }).toEqual({ idioma, claves: es });
    }
  });

  it('cada idioma usa los mismos parámetros {x} que el español', () => {
    const plano = (t: Translation) => Object.fromEntries(claves(t).map(k => [k, k.split('.').reduce((o: any, p) => o[p], t) as string]));
    const params = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    const es = plano(paginasEs);
    const distintos: string[] = [];
    for (const [idioma, dic] of Object.entries({ en: paginasEn, fr: paginasFr, pt: paginasPt, ko: paginasKo, zh: paginasZh })) {
      const d = plano(dic);
      for (const k of Object.keys(es)) if (params(d[k] ?? '') !== params(es[k])) distintos.push(`${idioma}: ${k}`);
    }
    expect(distintos).toEqual([]);
  });
});
