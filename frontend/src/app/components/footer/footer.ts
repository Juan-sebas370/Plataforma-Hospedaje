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

  paymentTrust = [
    { label: 'Mastercard', icon: 'mastercard', logoPath: '/assets/payment-methods/mastercard.jpg' },
    { label: 'Visa', icon: 'visa', logoPath: '/assets/payment-methods/visa.png' },
    { label: 'American Express', icon: 'amex', logoPath: '/assets/payment-methods/american-express.png' },
    { label: 'Diners Club', icon: 'diners', logoPath: '/assets/payment-methods/diners.png' },
    { label: 'RappiPay', icon: 'rappi', logoPath: '/assets/payment-methods/rappipay.png' }
  ];

  paymentSecure = [
    { label: 'PSE', icon: 'pse', logoPath: '/assets/payment-methods/pse.png' },
    { label: 'Nequi', icon: 'nequi', logoPath: '/assets/payment-methods/nequi.png' },
    { label: 'Daviplata', icon: 'daviplata', logoPath: '/assets/payment-methods/daviplata.png' },
    { label: 'Todas las tarjetas', icon: 'cards' }
  ];

  constructor(public translateService: TranslateService) {}

  selectLanguage(code: any): void {
    this.translateService.setLanguage(code);
  }
}
