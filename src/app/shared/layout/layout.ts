import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  standalone: true,
})
export class LayoutComponent {
  isLightMode = true;

  ngOnInit() {
    document.documentElement.classList.add('light-mode');
    document.body.classList.add('light-mode');
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    const html = document.documentElement;
    const body = document.body;
    if (this.isLightMode) {
      html.classList.replace('dark-mode', 'light-mode');
      body.classList.replace('dark-mode', 'light-mode');
    } else {
      html.classList.replace('light-mode', 'dark-mode');
      body.classList.replace('light-mode', 'dark-mode');
    }
  }
}
