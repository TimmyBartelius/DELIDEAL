import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../../../enums/product-category.enum';
import { UserService } from '../../../services/user.service';
import { FilterByNamePipe } from '../../../shared/filter-by-name.pipe';

declare var google: any;

interface Product {
  name: string;
  category: ProductCategory;
  image: string;
  price: number;
  stockLevel: 'Lite kvar' | 'Mellan kvar' | 'Mycket kvar';
  specialOffer: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule, FilterByNamePipe],
})
export class DashboardComponent implements OnInit {
  // MOCK PRODUCTS //
  products: Product[] = [
    {
      name: 'Räkor',
      category: ProductCategory.Seafood,
      image: 'assets/shrimp.jpg',
      price: 129,
      stockLevel: 'Mycket kvar',
      specialOffer: true,
    },
    {
      name: 'Kräftor',
      category: ProductCategory.Seafood,
      image: 'assets/crawfish.jpg',
      price: 179,
      stockLevel: 'Mellan kvar',
      specialOffer: false,
    },
    {
      name: 'Krabba',
      category: ProductCategory.Seafood,
      image: 'assets/crab.jpg',
      price: 199,
      stockLevel: 'Lite kvar',
      specialOffer: true,
    },
    {
      name: 'Lax',
      category: ProductCategory.Fish,
      image: 'assets/salmon.jpg',
      price: 99,
      stockLevel: 'Mycket kvar',
      specialOffer: false,
    },
    {
      name: 'Torsk',
      category: ProductCategory.Fish,
      image: 'assets/cod.jpg',
      price: 299,
      stockLevel: 'Mycket kvar',
      specialOffer: false,
    },
    {
      name: 'Sej',
      category: ProductCategory.Fish,
      image: 'assets/sej.jpg',
      price: 79,
      stockLevel: 'Mellan kvar',
      specialOffer: true,
    },
    {
      name: 'Entrecote',
      category: ProductCategory.Meat,
      image: 'assets/entrecote.jpg',
      price: 499,
      stockLevel: 'Lite kvar',
      specialOffer: false,
    },
    {
      name: 'Revben',
      category: ProductCategory.Meat,
      image: 'assets/ribs.jpg',
      price: 199,
      stockLevel: 'Lite kvar',
      specialOffer: true,
    },
    {
      name: 'Fransyska',
      category: ProductCategory.Meat,
      image: 'assets/fransyska.jpg',
      price: 299,
      stockLevel: 'Mellan kvar',
      specialOffer: false,
    },
    {
      name: 'Mögelost',
      category: ProductCategory.Cheese,
      image: 'assets/moldcheese.jpg',
      price: 19,
      stockLevel: 'Lite kvar',
      specialOffer: false,
    },
    {
      name: 'Mjukost',
      category: ProductCategory.Cheese,
      image: 'assets/softcheese.jpg',
      price: 9,
      stockLevel: 'Mellan kvar',
      specialOffer: false,
    },
    {
      name: 'Hårdost',
      category: ProductCategory.Cheese,
      image: 'assets/hardcheese.jpg',
      price: 49,
      stockLevel: 'Lite kvar',
      specialOffer: true,
    },
  ];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  categories: { category: ProductCategory; selected: boolean }[] = [];
  ///////////////////////////////////////////////////////
  @ViewChild('locationInput') locationInput!: ElementRef;

  map: any;
  circle: any;
  defaultCoords = { lat: 57.7089, lng: 11.9746 };

  userName: string = '';
  userProfileImage: string = 'assets/logo.png';
  radius: number = 10;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.filteredProducts = [...this.products];

    (window as any).initMap = this.initMap.bind(this);

    const token = this.auth.getAccessToken();
    console.log('Access token: ', token);
    this.loadUserProfile();
    this.loadGoogleMaps();
  }

  //Filtrering
  filterProducts() {
    const selectedCategories = this.categories.filter((c) => c.selected).map((c) => c.category);

    this.filteredProducts = this.products.filter((p) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesSearch =
        !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  onCategoryChange() {
    this.filterProducts();
  }

  /** Ladda användarprofil och profilbild med token */
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

  /** När användaren väljer en ny profilbild */
  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.resizeImage(file, 500, 500).then((resizedBase64) => {
        this.saveProfileImage(resizedBase64);
      });
    };
    reader.readAsDataURL(file);
  }

  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => (img.src = e.target.result);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Cannot get canvas context!');

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /** Spara profilbild på backend */
  private saveProfileImage(base64: string) {
    const pureBase64 = base64.split(',')[1].replace(/\s/g, '');
    this.userService.saveProfilePicture(pureBase64).subscribe({
      next: () => {
        this.userProfileImage = base64;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to save profile picture!', err),
    });
  }

  /** Logga ut */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Google Maps-relaterat
  loadGoogleMaps() {
    if ((window as any).google) {
      this.initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE`;
    script.defer = true;
    script.async = true;
    script.onload = () => this.initMap();
    document.head.appendChild(script);
  }

  initMap() {
    const mapOptions = { center: this.defaultCoords, zoom: 10 };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
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
      radius: this.radius * 1000,
    });

    this.map.setCenter({ lat, lng });
  }

  searchCity() {
    const city = (this.locationInput.nativeElement as HTMLInputElement).value;
    if (!city) return;

    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        city,
      )}&key=AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE`,
    )
      .then((res) => res.json())
      .then((data: any) => {
        if (data.results && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          this.drawCircle(loc.lat, loc.lng);
        } else alert('Staden hittades inte.');
      })
      .catch((err) => console.error(err));
  }

  updateRadius() {
    if (this.circle) this.circle.setRadius(this.radius * 1000);
  }

  loadCategories() {
    this.categories = Object.values(ProductCategory).map((category) => ({
      category,
      selected: false,
    }));
  }
}
