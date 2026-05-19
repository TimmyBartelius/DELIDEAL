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
  imports: [FormsModule, CommonModule],
})
export class HomeComponent {
  searchQuery: string = '';

  constructor(
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      const role = this.auth.getUserRole();
      if (role === 'merchant') {
        this.router.navigate(['/reseller']);
      } else if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
