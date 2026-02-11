// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  template: `<h1>Välkommen till DELIDEAL!</h1>`,
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent {}
