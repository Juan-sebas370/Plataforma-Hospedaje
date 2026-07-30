import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageSelector } from '../language-selector/language-selector';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule, LanguageSelector, TranslatePipe],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class Nav {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
