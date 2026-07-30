import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../shared/translate.pipe';


@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  languages = [
    { code: 'es', name: 'footer.spanish', flag: '/flags/es.png' },
    { code: 'en', name: 'footer.english', flag: '/flags/en.png' },
    { code: 'fr', name: 'footer.french', flag: '/flags/fr.png' },
    { code: 'pt', name: 'footer.portuguese', flag: '/flags/pt.png' },
    { code: 'ko', name: 'footer.korean', flag: '/flags/ko.png' },
    { code: 'zh', name: 'footer.chinese', flag: '/flags/zh.png' }
  ];

  constructor(public translateService: TranslateService) {}

  selectLanguage(code: any): void {
    this.translateService.setLanguage(code);
  }
}
