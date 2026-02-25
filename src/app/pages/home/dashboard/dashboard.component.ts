import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../../../enums/product-category.enum';
import { UserService } from '../../../services/user.service';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  @ViewChild('locationInput') locationInput!: ElementRef;

  map: any;
  circle: any;
  defaultCoords = { lat: 57.7089, lng: 11.9746 };

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
      radius: this.radius * 1000,
    });
    this.map.setCenter({ lat, lng });
  }

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
    (window as any).initMap = this.initMap.bind(this);

    const token = this.auth.getAccessToken();
    console.log('Access token: ', token);
    this.loadUserProfile();
    this.loadCategories();
    this.loadGoogleMaps();
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
  //Related to the google maps
  loadGoogleMaps() {
    if ((window as any).google) {
      this.initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      if ((window as any).initMap) (window as any).initMap();
    };
    document.head.appendChild(script);
  }

  initMap() {
    const mapOptions = {
      center: this.defaultCoords,
      zoom: 10,
    };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
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
  updateRadius() {
    if (this.circle) {
      this.circle.setRadius(this.radius * 1000);
    }
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
