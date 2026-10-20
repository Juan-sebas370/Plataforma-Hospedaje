import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconoNombre =
  | 'user' | 'users' | 'sun' | 'briefcase' | 'calendar' | 'bed' | 'bath' | 'home' | 'layers'
  | 'check' | 'arrow-right' | 'arrow-left' | 'chevron-left' | 'chevron-right' | 'close' | 'edit'
  | 'lock' | 'info' | 'alert' | 'sparkle' | 'wallet' | 'shield' | 'wifi' | 'plus' | 'minus'
  | 'image' | 'mail' | 'phone' | 'id' | 'clock' | 'star' | 'moon'
  | 'accesibilidad' | 'contraste' | 'gotas' | 'link' | 'tipografia' | 'espaciado' | 'teclado'
  | 'cursor' | 'pausa' | 'play' | 'restablecer' | 'texto-menos' | 'texto-mas' | 'corazon' | 'mensaje' | 'libro' | 'enviar'
  | 'descargar' | 'imprimir' | 'copiar' | 'ubicacion';

/** Íconos de línea (estilo Feather) usados en todo el asistente de reservas. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display:inline-flex;line-height:0' },
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" [attr.stroke-width]="stroke()" stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/> }
        @case ('users') { <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/> }
        @case ('sun') { <circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2.5M12 20v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1.5 12H4M20 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"/> }
        @case ('briefcase') { <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/> }
        @case ('calendar') { <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/> }
        @case ('bed') { <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M2 16h20M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/> }
        @case ('bath') { <path d="M4 12h16a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 3.4-1.4"/> }
        @case ('home') { <path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/> }
        @case ('layers') { <path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/> }
        @case ('check') { <path d="M20 6 9 17l-5-5"/> }
        @case ('arrow-right') { <path d="M5 12h14M13 5l7 7-7 7"/> }
        @case ('arrow-left') { <path d="M19 12H5M11 19l-7-7 7-7"/> }
        @case ('chevron-left') { <path d="m15 18-6-6 6-6"/> }
        @case ('chevron-right') { <path d="m9 18 6-6-6-6"/> }
        @case ('close') { <path d="M18 6 6 18M6 6l12 12"/> }
        @case ('edit') { <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/> }
        @case ('lock') { <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/> }
        @case ('info') { <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/> }
        @case ('alert') { <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/> }
        @case ('sparkle') { <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/> }
        @case ('wallet') { <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/> }
        @case ('shield') { <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> }
        @case ('wifi') { <path d="M5 12.6a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/> }
        @case ('plus') { <path d="M12 5v14M5 12h14"/> }
        @case ('minus') { <path d="M5 12h14"/> }
        @case ('image') { <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/> }
        @case ('mail') { <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/> }
        @case ('phone') { <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/> }
        @case ('id') { <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h5M14 14h3"/> }
        @case ('clock') { <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/> }
        @case ('star') { <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/> }
        @case ('accesibilidad') { <circle cx="12" cy="4.5" r="2"/><path d="M4 8.5c2.7.9 5.3 1.3 8 1.3s5.3-.4 8-1.3M12 9.8V15m0 0-3 6.5M12 15l3 6.5"/> }
        @case ('contraste') { <circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/> }
        @case ('gotas') { <path d="M12 2.7 6.3 9a7.2 7.2 0 1 0 11.4 0z"/><path d="M12 20.5a5 5 0 0 1-5-5" /> }
        @case ('link') { <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/> }
        @case ('tipografia') { <path d="M4 7V4h16v3M9 20h6M12 4v16"/> }
        @case ('espaciado') { <path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 4v16M2.5 6 4 4l1.5 2M2.5 18 4 20l1.5-2"/> }
        @case ('teclado') { <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10"/> }
        @case ('cursor') { <path d="m4 3 7 17 2.5-7.5L21 10z"/><path d="m13.5 12.5 6 6"/> }
        @case ('pausa') { <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/> }
        @case ('play') { <path d="m6 4 14 8-14 8z"/> }
        @case ('restablecer') { <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/> }
        @case ('texto-menos') { <path d="M3 19 8.5 5h1L15 19M5 14h8"/><path d="M17 12h5"/> }
        @case ('texto-mas') { <path d="M3 19 8.5 5h1L15 19M5 14h8"/><path d="M19.5 9.5v5M17 12h5"/> }
        @case ('corazon') { <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/> }
        @case ('mensaje') { <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> }
        @case ('libro') { <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/> }
        @case ('enviar') { <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/> }
        @case ('descargar') { <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/> }
        @case ('imprimir') { <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/> }
        @case ('copiar') { <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/> }
        @case ('ubicacion') { <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/> }
        @case ('moon') { <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/> }
      }
    </svg>
  `,
})
export class Icono {
  readonly name = input.required<IconoNombre>();
  readonly size = input(18);
  readonly stroke = input(1.8);
}
