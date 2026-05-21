import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { StoreService } from '../../../services/store.service';
import { UiService } from '../../../services/ui.service';
import { PriceAlertService, PriceAlertDto } from '../../../services/price-alert.service';

import { MapComponent } from '../../../shared/map/map.component';
import { Product } from '../../../shared/models/product.model';
import { Merchant } from '../../../shared/models/merchant.model';
import { ProductCategory } from '../../../../enums/product-category.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: `dashboard.component.html`,
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent, RouterModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
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

  // Profile panel
  showProfilePanel: boolean = true;
  editName: string = '';
  nameError: string = '';
  nameSuccess: string = '';
  savingName: boolean = false;
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';
  savingPassword: boolean = false;

  isLightMode: boolean = true;
  private profileSub?: Subscription;

  // Price alerts
  priceAlerts: PriceAlertDto[] = [];
  watchModalProduct: any = null; // product being watched
  watchModalPrice: number | null = null;
  savingAlert: boolean = false;

  allProductNames: string[] = [];
  showSuggestions: boolean = false;
  showMobileMenu: boolean = false;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private storeService: StoreService,
    private ui: UiService,
    private priceAlertSvc: PriceAlertService,
  ) {}

  ngOnInit(): void {
    this.isLightMode = !document.documentElement.classList.contains('dark-mode');
    this.loadCategories();
    this.filteredProducts = [];
    this.setupMerchants();
    this.loadUserProfile();

    this.allProductNames = this.products.map((p) => p.name);

    this.loadPriceAlerts();

    this.profileSub = this.ui.profileOpen$.subscribe(() => {
      this.showProfilePanel = true;
      this.showMobileMenu = true;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
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

  onSearchTermChange() {
    this.showSuggestions = true;
    this.filterMerchantsBySearch();
    this.safeDrawMarkers();
  }
  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 150);
  }
  highlightMatch(suggestion: string): string {
    if (!this.searchTerm) return suggestion;
    const term = this.searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${term})`, 'gi');
    return suggestion.replace(regex, `<mark>$1</mark>`);
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
    this.filteredMerchants = [...this.merchants];

    // Hämta riktiga handlare från API och lägg till i listan
    this.storeService.getAllStores().subscribe({
      next: (stores) => {
        const realMerchants: Merchant[] = stores.map((s) => ({
          id: s.id,
          name: s.name,
          city: s.city || 'Sverige',
          address: s.address,
          image: s.logoBase64 ? `data:image/jpeg;base64,${s.logoBase64}` : 'assets/logo.png',
          latitude: s.latitude || 57.7089,
          longitude: s.longitude || 11.9746,
          products: s.products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category as ProductCategory,
            image: p.imageBase64 ? `data:image/jpeg;base64,${p.imageBase64}` : 'assets/logo.png',
            price: p.specialOffer && p.offerPrice != null ? p.offerPrice : p.price,
            stockLevel: (p.stockAmount > 20
              ? 'Mycket kvar'
              : p.stockAmount > 5
                ? 'Mellan kvar'
                : 'Lite kvar') as 'Lite kvar' | 'Mellan kvar' | 'Mycket kvar',
            specialOffer: p.specialOffer,
          })),
        }));
        realMerchants.forEach((m) => (m.productsFiltered = [...m.products]));
        this.merchants = [...this.merchants, ...realMerchants];
        this.filteredMerchants = [...this.merchants];
        this.allProductNames = [
          ...this.products.map((p) => p.name),
          ...realMerchants.flatMap((m) => m.products.map((p) => p.name)),
        ];
        this.cd.detectChanges();
      },
      error: () => {
        // Fortsätt med enbart mock-handlarna om API inte svarar
      },
    });
  }

  loadCategories() {
    this.categories = Object.values(ProductCategory).map((category) => ({
      category,
      selected: false,
    }));
  }

  filterMerchantsBySearch() {
    const search = this.searchTerm.toLowerCase();
    this.filteredMerchants = this.merchants.filter((m) =>
      m.products.some(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (typeof p.category === 'string' && p.category.toLowerCase().includes(search)),
      ),
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
        this.userName = data.userName;
        this.editName = data.userName;
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

  saveName() {
    this.nameError = '';
    this.nameSuccess = '';
    if (!this.editName.trim()) {
      this.nameError = 'Namn får inte vara tomt.';
      return;
    }
    this.savingName = true;
    this.userService.updateName(this.editName.trim()).subscribe({
      next: () => {
        this.userName = this.editName.trim();
        this.nameSuccess = 'Namn sparat!';
        this.savingName = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.nameError =
          err.status === 409 ? 'Användarnamnet är redan taget.' : 'Kunde inte spara namn.';
        this.savingName = false;
        this.cd.detectChanges();
      },
    });
  }

  savePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Fyll i alla lösenordsfält.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Nya lösenorden matchar inte.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'Lösenordet måste vara minst 6 tecken.';
      return;
    }
    this.savingPassword = true;
    this.userService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess = 'Lösenord bytt!';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.savingPassword = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.passwordError =
          err.status === 400 ? 'Nuvarande lösenord är fel.' : 'Kunde inte byta lösenord.';
        this.savingPassword = false;
        this.cd.detectChanges();
      },
    });
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  loadPriceAlerts() {
    this.priceAlertSvc.getAlerts().subscribe({
      next: (alerts) => {
        this.priceAlerts = alerts;
        this.cd.detectChanges();
      },
      error: () => {},
    });
  }

  getAlertForProduct(productId: string): PriceAlertDto | undefined {
    return this.priceAlerts.find((a) => a.productId === productId && !a.isTriggered);
  }

  openWatchModal(product: any) {
    this.watchModalProduct = product;
    const existing = this.getAlertForProduct(product.id);
    this.watchModalPrice = existing ? existing.targetPrice : product.price;
    this.cd.detectChanges();
  }

  closeWatchModal() {
    this.watchModalProduct = null;
    this.watchModalPrice = null;
    this.cd.detectChanges();
  }

  saveWatch() {
    if (!this.watchModalProduct || !this.watchModalPrice || this.watchModalPrice <= 0) return;
    this.savingAlert = true;
    this.priceAlertSvc
      .createAlert(
        this.watchModalProduct.id,
        this.selectedMerchant!.id as string,
        this.watchModalProduct.name,
        this.selectedMerchant!.name,
        this.watchModalPrice,
      )
      .subscribe({
        next: (alert) => {
          // Replace existing or add new
          this.priceAlerts = [
            ...this.priceAlerts.filter((a) => a.productId !== alert.productId),
            alert,
          ];
          this.savingAlert = false;
          this.closeWatchModal();
        },
        error: () => {
          this.savingAlert = false;
          this.cd.detectChanges();
        },
      });
  }

  removeWatch(productId: string) {
    const alert = this.getAlertForProduct(productId);
    if (!alert) return;
    this.priceAlertSvc.deleteAlert(alert.id).subscribe({
      next: () => {
        this.priceAlerts = this.priceAlerts.filter((a) => a.id !== alert.id);
        this.cd.detectChanges();
      },
      error: () => {},
    });
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin;
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
