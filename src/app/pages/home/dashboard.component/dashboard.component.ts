import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { ProductCategory } from '../../../../enums/product-category.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  searchTerm: string = '';
  userName: string = '';
  userProfileImage: string = 'assets/logo.png';
  radius: number = 10;
  categories: { category: ProductCategory; selected: boolean }[] = [];

  private apiBase = environment.apis.default.url;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadUserProfile();
    }, 0);

    this.loadCategories();
  }

  private getAuthHeaders() {
    const token = this.auth.getAccessToken();
    if (!token) return null;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadUserProfile() {
    const headers = this.getAuthHeaders();

    if (!headers) {
      console.error('No token found');

      return;
    }

    this.http.get<any>(`${this.apiBase}/api/account/my-profile`, { headers }).subscribe({
      next: (data) => {
        this.userName = data.userName;
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('PROFILE ERROR:', err);
      },
    });
  }

  loadCategories() {
    this.categories = Object.values(ProductCategory).map((category) => ({
      category,
      selected: false,
    }));
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
