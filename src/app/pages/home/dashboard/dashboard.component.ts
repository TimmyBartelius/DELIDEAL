import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

import { MapComponent } from '../../../shared/map/map.component';
import { Product } from '../../../shared/models/product.model';
import { Merchant } from '../../../shared/models/merchant.model';
import { ProductCategory } from '../../../../enums/product-category.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
})
export class DashboardComponent implements OnInit {
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('map') mapComponent!: MapComponent;
  @ViewChild('detailMap') detailMap!: MapComponent;

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

  merchants: Merchant[] = [];
  filteredMerchants: Merchant[] = [];
  selectedMerchant: Merchant | null = null;
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  categories: { category: ProductCategory; selected: boolean }[] = [];
  radius: number = 1;

  userName: string = '';
  userProfileImage: string = 'assets/logo.png';

  allProductNames: string[] = [];

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.filteredProducts = [];
    this.setupMerchants();
    this.filteredMerchants = [...this.merchants];
    this.loadUserProfile();

    this.allProductNames = this.products.map((p) => p.name);
  }
  get filteredProductSuggestions(): string[] {
    if (!this.searchTerm) return [];
    const term = this.searchTerm.toLowerCase();
    return this.allProductNames.filter((name) => name.toLowerCase().includes(term));
  }
  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.filterMerchantsBySearch();
    this.safeDrawMarkers();
  }

  setupMerchants() {
    this.merchants = [
      {
        id: 1,
        name: 'Kött & Hav Göteborg',
        city: 'Göteborg',
        address: 'Kungstorget 1, Göteborg',
        image: 'assets/meat&ocean-merchant.jpg',
        latitude: 57.7089,
        longitude: 11.9746,
        products: this.products.filter((p) => ['Entrecote', 'Lax', 'Räkor'].includes(p.name)),
      },
      {
        id: 2,
        name: 'ICA Maxi Göteborg',
        city: 'Göteborg',
        address: 'Grafiska vägen 16, Göteborg',
        image: 'assets/ICA-Maxi-Merchant.jpg',
        latitude: 57.695,
        longitude: 11.996,
        products: this.products.filter((p) => ['Revben', 'Mögelost', 'Krabba'].includes(p.name)),
      },
      {
        id: 3,
        name: 'COOP Eriksberg',
        city: 'Göteborg',
        address: 'Monsungatan 2, Göteborg',
        image: 'assets/COOP-Eriksberg-Merchant.png',
        latitude: 57.7081,
        longitude: 11.9135,
        products: this.products.filter((p) => ['Krabba', 'Hårdost', 'Sej'].includes(p.name)),
      },
    ];
    this.merchants.forEach((m) => (m.productsFiltered = [...m.products]));
  }

  loadCategories() {
    this.categories = Object.values(ProductCategory).map((category) => ({
      category,
      selected: false,
    }));
  }

  filterMerchantsBySearch() {
    this.filteredMerchants = this.merchants.filter((m) =>
      m.products.some((p) => p.name.toLowerCase().includes(this.searchTerm.toLowerCase())),
    );
    if (this.mapComponent?.drawMerchantMarkers) {
      this.mapComponent.drawMerchantMarkers(this.filteredMerchants);
    }
  }

  filterProductsByCategory() {
    if (!this.selectedMerchant) return;

    const selectedCategories = this.categories.filter((c) => c.selected).map((c) => c.category);

    if (selectedCategories.length === 0) {
      this.selectedMerchant.productsFiltered = [...this.selectedMerchant.products];
    } else {
      this.selectedMerchant.productsFiltered = this.selectedMerchant.products.filter((p) =>
        selectedCategories.includes(p.category),
      );
    }
  }

  // filterProducts() {
  //   const selectedCategories = this.categories.filter((c) => c.selected).map((c) => c.category);

  //   let merchantsInRadius: Merchant[] = this.merchants;
  //   const center = this.mapComponent?.circle?.getCenter();
  //   if (center && this.mapComponent) {
  //     merchantsInRadius = this.mapComponent.getMerchantsWithinRadius(
  //       { lat: center.lat(), lng: center.lng() },
  //       this.radius,
  //     );
  //   }

  //   this.filteredMerchants = merchantsInRadius
  //     .map((m) => {
  //       const filteredProducts = m.products.filter(
  //         (p) =>
  //           (selectedCategories.length === 0 || selectedCategories.includes(p.category)) &&
  //           (!this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase())),
  //       );

  //       if (filteredProducts.length > 0) {
  //         return { ...m, products: filteredProducts };
  //       } else {
  //         return null;
  //       }
  //     })
  //     .filter((m): m is Merchant => m !== null);

  //   this.filteredProducts = this.filteredMerchants.flatMap((m) => m.products);

  //   if (this.mapComponent?.drawMerchantMarkers) {
  //     this.mapComponent.drawMerchantMarkers(this.filteredMerchants);
  //   }
  // }

  // onCategoryChange() {
  //   this.filterProducts();
  // }

  selectMerchant(merchant: Merchant) {
    this.selectedMerchant = merchant;
    this.cd.detectChanges();

    setTimeout(() => {
      if (this.detailMap && this.detailMap.map) {
        this.detailMap.drawMerchantMarkers([merchant]);
        this.detailMap.map.setCenter({
          lat: merchant.latitude,
          lng: merchant.longitude,
        });
        this.detailMap.map.setZoom(15);
      }
    }, 0);
  }

  updateRadius() {
    if (!this.mapComponent) return;
    this.mapComponent.radius = this.radius;
    this.filterMerchantsBySearch();
  }

  onMapCenterChanged(center: { lat: number; lng: number }) {
    this.filterMerchantsBySearch();
  }
  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.resizeImage(file, 500, 500).then((resizedBase64) => {
      this.saveProfileImage(resizedBase64);
    });
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
          this.filterMerchantsBySearch();
        } else {
          alert('Staden hittades inte.');
        }
      })
      .catch((err) => console.error(err));
  }

  loadUserProfile() {
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        ((this.userName = data.userName), this.cd.detectChanges());
      },
      error: (err) => console.error('PROFILE ERROR', err),
    });
    this.userService.getProfilePicture().subscribe({
      next: (res) => {
        this.userProfileImage = `data:image/png;base,${res.base64}`;
        this.cd.detectChanges();
      },
      error: () => {
        this.userProfileImage = 'assets/logo.png';
      },
    });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
  safeDrawMarkers() {
    if (this.selectedMerchant) {
      if (this.detailMap?.drawMerchantMarkers) {
        this.detailMap.drawMerchantMarkers([this.selectedMerchant]);
      }
    } else {
      if (this.mapComponent?.drawMerchantMarkers) {
        this.mapComponent.drawMerchantMarkers(this.filteredMerchants);
      }
    }
  }
}
