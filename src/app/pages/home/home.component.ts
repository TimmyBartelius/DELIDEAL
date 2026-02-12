import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class HomeComponent {
  searchQuery: string = '';

  constructor(private router: Router, public auth: AuthService) {}

  // Körs när användaren trycker på sök
  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Söker efter:', this.searchQuery);
      // Här kan du navigera till sökresultatsidan eller göra API-anrop
      // Exempel: this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
