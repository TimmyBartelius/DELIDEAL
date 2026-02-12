import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  standalone: true,
  imports: [CommonModule],
})
export class DashboardComponent {

  constructor(private auth: AuthService, private router: Router){}

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
