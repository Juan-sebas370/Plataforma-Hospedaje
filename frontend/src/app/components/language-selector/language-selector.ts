import { HostListener, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, Language } from '../../services/translate.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { ClickOutsideDirective } from '../../shared/click-outside.directive';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, ClickOutsideDirective, TranslatePipe],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css',
})
export class LanguageSelector implements OnInit {
  currentLang: Language = 'es';
  showDropdown = false;

  languages: LanguageOption[] = [
    { code: 'es', name: 'Español', flag: '/assets/flags/es.png' },
    { code: 'en', name: 'English', flag: '/assets/flags/en.png' },
    { code: 'fr', name: 'Français', flag: '/assets/flags/fr.png' },
    { code: 'pt', name: 'Português', flag: '/assets/flags/pt.png' },
    { code: 'ko', name: '한국어', flag: '/assets/flags/ko.png' },
    { code: 'zh', name: '中文', flag: '/assets/flags/zh.png' }
  ];

  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    this.currentLang = this.translateService.getCurrentLanguage();
    
    // Escuchar cambios de idioma
    this.translateService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  getCurrentLanguage(): LanguageOption {
    return this.languages.find(l => l.code === this.currentLang) || this.languages[0];
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectLanguage(lang: Language): void {
    this.translateService.setLanguage(lang);
    this.showDropdown = false;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.showDropdown = false;
  }
}
