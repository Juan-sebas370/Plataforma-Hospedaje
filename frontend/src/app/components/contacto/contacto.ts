import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {

}
