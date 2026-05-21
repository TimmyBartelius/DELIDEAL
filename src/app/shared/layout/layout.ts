import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  standalone: true,
})
export class LayoutComponent {
  isLightMode = true;

  constructor(
    public auth: AuthService,
    private ui: UiService,
  ) {}

  ngOnInit() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    this.isLightMode = !isDark;
    if (!isDark) {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    const html = document.documentElement;
    const body = document.body;
    if (this.isLightMode) {
      html.classList.remove('dark-mode');
      html.classList.add('light-mode');
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    } else {
      html.classList.remove('light-mode');
      html.classList.add('dark-mode');
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
  }

  openProfile() {
    this.ui.openProfile();
  }
}
