import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../../../enums/product-category.enum';
import { UserService } from '../../../services/user.service';

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

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCategories();
  }

  /** Ladda användarprofil och profilbild med token */
  loadUserProfile() {
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.userName = data.userName;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('PROFILE ERROR', err);
      },
    });

    // --- Ladda profilbild ---
    this.userService.getProfilePicture().subscribe({
      next: (res) => {
        this.userProfileImage = `data:image/png;base64,${res.base64}`;
        this.cd.detectChanges();
      },
      error: () => {
        this.userProfileImage = 'assets/logo.png';
      },
    });
  }

  /** När användaren väljer en ny profilbild */
  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.saveProfileImage(base64);
    };
    reader.readAsDataURL(file);
  }

  /** Spara profilbild på backend */
  private saveProfileImage(base64: string) {
    this.userService.saveProfilePicture(base64).subscribe({
      next: () => {
        this.userProfileImage = base64;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to save profile picture!', err);
      },
    });
  }

  /** Ladda produktkategorier */
  loadCategories() {
    this.categories = Object.values(ProductCategory).map((category) => ({
      category,
      selected: false,
    }));
  }

  /** Logga ut */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
