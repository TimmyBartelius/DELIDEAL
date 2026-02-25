import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../app/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../../../src/enums/product-category.enum';
import { UserService } from '../../../app/services/user.service';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: `../../pages/home/dashboard/dashboard.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('locationInput') locationInput!: ElementRef;

  apiKey = 'AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE';

  searchTerm: string = '';
  userName: string = '';
  userProfileImage: string = 'assets/logo.png';
  radius: number = 10;
  categories: { category: ProductCategory; selected: boolean }[] = [];

  // Google Maps
  map: any;
  circle: any;
  defaultCoords = { lat: 57.7089, lng: 11.9746 }; // Göteborg fallback

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

  ngAfterViewInit(): void {
    // Kontrollera att google.maps finns
    const waitForGoogle = () => {
      if ((window as any)['google'] && (window as any)['google'].maps) {
        this.initMap(this.defaultCoords.lat, this.defaultCoords.lng);
      } else {
        setTimeout(waitForGoogle, 100); // prova igen om 100ms
      }
    };
    waitForGoogle();
  }

  // --- Google Maps ---
  initMap(lat: number, lng: number) {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat, lng },
      zoom: 13,
    });
    this.drawCircle(lat, lng);
  }

  drawCircle(lat: number, lng: number) {
    if (this.circle) this.circle.setMap(null);

    this.circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.2,
      map: this.map,
      center: { lat, lng },
      radius: this.radius * 1000, // km → meter
    });

    this.map.setCenter({ lat, lng });
  }

  updateRadius() {
    if (this.circle) {
      this.circle.setRadius(this.radius * 1000);
    }
  }

  useCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.drawCircle(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('Geolocation failed or denied', err);
          alert('Kan inte hämta din position. Ange stad manuellt.');
        },
      );
    } else {
      alert('Geolocation stöds inte i din browser.');
    }
  }

  searchCity() {
    const city = (this.locationInput.nativeElement as HTMLInputElement).value;
    if (!city) return;

    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE`,
    )
      .then((res) => res.json())
      .then((data: any) => {
        if (data.results && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          this.drawCircle(loc.lat, loc.lng);
        } else {
          alert('Staden hittades inte.');
        }
      })
      .catch((err) => console.error(err));
  }

  // --- Profil + kategorier ---
  loadUserProfile() {
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.userName = data.userName;
        this.cd.detectChanges();
      },
      error: (err) => console.error('PROFILE ERROR', err),
    });

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

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.saveProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  private saveProfileImage(base64: string) {
    this.userService.saveProfilePicture(base64).subscribe({
      next: () => {
        this.userProfileImage = base64;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to save profile picture!', err),
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
    this.router.navigate(['/login']);
  }
}
