import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-servicios',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {

}
