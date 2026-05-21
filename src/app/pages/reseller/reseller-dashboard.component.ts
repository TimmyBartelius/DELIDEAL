import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MerchantPortalService } from '../../services/merchant-portal.service';
import { MerchantApi, OfferApi, ProductApi } from '../../shared/models/merchant-api.model';

@Component({
  selector: 'app-reseller-dashboard',
  templateUrl: './reseller-dashboard.component.html',
  styleUrls: ['./reseller-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ResellerDashboardComponent implements OnInit {
  // ── Globalt ─────────────────────────────────────────────────────
  activeTab: 'store' | 'products' = 'store';
  loading = false;
  globalError: string | null = null;

  // ── Butiksprofil ─────────────────────────────────────────────────
  store: MerchantApi | null = null;
  storeForm = { name: '', address: '', phone: '', city: '', latitude: 57.7089, longitude: 11.9746 };
  storeImagePreview = '';
  storeImageB64 = '';
  savingStore = false;
  storeSaved = false;

  // ── Produkter ─────────────────────────────────────────────────────
  products: ProductApi[] = [];
  offers: OfferApi[] = [];

  // Redigera produkt inline
  editingProductId: string | null = null;
  editProductForm = {
    name: '',
    category: '',
    price: 0,
    stockAmount: 0,
    unit: 'kg',
    isAvailable: true,
  };
  editProductImagePreview = '';
  editProductImageB64 = '';
  savingProduct = false;

  // Lägg till produkt
  showAddProduct = false;
  newProductForm = { name: '', category: 'Fisk', price: 0, stockAmount: 0, unit: 'kg' };
  newProductImageB64 = '';
  newProductImagePreview = '';
  addingProduct = false;

  // Erbjudanden
  offerProductId: string | null = null;
  newOfferForm = { discountPercent: 0, endsAt: '' };
  addingOffer = false;

  readonly categories = [
    'Fisk',
    'Skaldjur',
    'Kött',
    'Ost',
    'Mejeri',
    'Grönsaker',
    'Frukt',
    'Övrigt',
  ];

  constructor(
    public authService: AuthService,
    private portalService: MerchantPortalService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.portalService.getMyStore().subscribe({
      next: (store) => {
        this.store = store;
        this.storeForm = {
          name: store.name,
          address: store.address,
          phone: store.phone,
          city: store.city ?? '',
          latitude: store.latitude ?? 57.7089,
          longitude: store.longitude ?? 11.9746,
        };
        this.storeImagePreview = store.logoBase64
          ? `data:image/jpeg;base64,${store.logoBase64}`
          : '';
        this.loadProducts(store.id);
      },
      error: (err) => {
        this.globalError = 'Kunde inte ladda butiksinformation.';
        this.loading = false;
        this.cd.detectChanges();
        console.error(err);
      },
    });
  }

  private loadProducts(merchantId: string): void {
    this.portalService.getProducts(merchantId).subscribe({
      next: (products) => {
        this.products = products;
        this.loadOffers(merchantId);
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  private loadOffers(merchantId: string): void {
    this.portalService.getOffers(merchantId).subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  // ── Butiksprofil ─────────────────────────────────────────────────
  onStoreImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toBase64(file).then((b64) => {
      this.storeImageB64 = b64.split(',')[1];
      this.storeImagePreview = b64;
      this.cd.detectChanges();
    });
  }

  saveStore(): void {
    if (!this.store) return;
    this.savingStore = true;
    this.storeSaved = false;
    const fields: Record<string, unknown> = {
      Name: this.storeForm.name,
      Address: this.storeForm.address,
      Phone: this.storeForm.phone,
      City: this.storeForm.city,
      Latitude: this.storeForm.latitude,
      Longitude: this.storeForm.longitude,
    };
    if (this.storeImageB64) fields['LogoBase64'] = this.storeImageB64;

    this.portalService.updateMyStore(fields).subscribe({
      next: () => {
        this.savingStore = false;
        this.storeSaved = true;
        this.store!.name = this.storeForm.name;
        this.cd.detectChanges();
        setTimeout(() => {
          this.storeSaved = false;
          this.cd.detectChanges();
        }, 3000);
      },
      error: () => {
        this.savingStore = false;
        this.cd.detectChanges();
      },
    });
  }

  // ── Produkter — redigering ────────────────────────────────────────
  startEditProduct(product: ProductApi): void {
    this.editingProductId = product.id;
    this.editProductForm = {
      name: product.name,
      category: product.category,
      price: product.price,
      stockAmount: product.stockAmount,
      unit: product.unit,
      isAvailable: product.isAvailable,
    };
    this.editProductImagePreview = product.imageBase64
      ? `data:image/jpeg;base64,${product.imageBase64}`
      : '';
    this.editProductImageB64 = '';
  }

  cancelEditProduct(): void {
    this.editingProductId = null;
  }

  onEditProductImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toBase64(file).then((b64) => {
      this.editProductImageB64 = b64.split(',')[1];
      this.editProductImagePreview = b64;
      this.cd.detectChanges();
    });
  }

  saveProduct(productId: string): void {
    if (!this.store) return;
    this.savingProduct = true;
    const fields: Record<string, unknown> = {
      Name: this.editProductForm.name,
      Category: this.editProductForm.category,
      Price: this.editProductForm.price,
      StockAmount: this.editProductForm.stockAmount,
      Unit: this.editProductForm.unit,
      IsAvailable: this.editProductForm.isAvailable,
    };
    if (this.editProductImageB64) fields['ImageBase64'] = this.editProductImageB64;

    this.portalService.updateProduct(this.store.id, productId, fields).subscribe({
      next: () => {
        const p = this.products.find((x) => x.id === productId);
        if (p) Object.assign(p, { ...this.editProductForm });
        if (this.editProductImageB64) p!.imageBase64 = this.editProductImageB64;
        this.savingProduct = false;
        this.editingProductId = null;
        this.cd.detectChanges();
      },
      error: () => {
        this.savingProduct = false;
        this.cd.detectChanges();
      },
    });
  }

  deleteProduct(productId: string): void {
    if (!this.store) return;
    if (!confirm('Vill du verkligen ta bort produkten?')) return;
    this.portalService.deleteProduct(this.store.id, productId).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== productId);
        this.offers = this.offers.filter((o) => o.productId !== productId);
        if (this.editingProductId === productId) this.editingProductId = null;
        if (this.offerProductId === productId) this.offerProductId = null;
      },
      error: (err) => console.error('[Reseller] deleteProduct fel:', err.status),
    });
  }

  // ── Produkter — ny produkt ────────────────────────────────────────
  onNewProductImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toBase64(file).then((b64) => {
      this.newProductImageB64 = b64.split(',')[1];
      this.newProductImagePreview = b64;
      this.cd.detectChanges();
    });
  }

  addProduct(): void {
    if (!this.store) return;
    if (
      !this.newProductForm.name ||
      this.newProductForm.price <= 0 ||
      this.newProductForm.stockAmount < 0
    )
      return;
    this.addingProduct = true;

    const payload: Record<string, unknown> = {
      Name: this.newProductForm.name,
      Category: this.newProductForm.category,
      Price: this.newProductForm.price,
      StockAmount: this.newProductForm.stockAmount,
      Unit: this.newProductForm.unit,
      IsAvailable: true,
      ImageBase64: this.newProductImageB64 || '',
    };

    this.portalService.createProduct(this.store.id, payload).subscribe({
      next: (created) => {
        this.products.push(created);
        this.newProductForm = { name: '', category: 'Fisk', price: 0, stockAmount: 0, unit: 'kg' };
        this.newProductImageB64 = '';
        this.newProductImagePreview = '';
        this.showAddProduct = false;
        this.addingProduct = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.addingProduct = false;
        this.cd.detectChanges();
      },
    });
  }

  // ── Erbjudanden ──────────────────────────────────────────────────
  getActiveOffer(productId: string): OfferApi | undefined {
    const now = new Date();
    return this.offers.find(
      (o) => o.productId === productId && o.isActive && new Date(o.endsAt) >= now,
    );
  }

  calcOfferPrice(basePrice: number, discountPercent: number): number {
    return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
  }

  toggleOfferForm(productId: string): void {
    this.offerProductId = this.offerProductId === productId ? null : productId;
    this.newOfferForm = { discountPercent: 0, endsAt: '' };
  }

  addOffer(product: ProductApi): void {
    if (!this.store || !this.newOfferForm.discountPercent || !this.newOfferForm.endsAt) return;
    this.addingOffer = true;
    const dto = {
      productId: product.id,
      discountPercent: this.newOfferForm.discountPercent,
      startsAt: new Date().toISOString(),
      endsAt: new Date(this.newOfferForm.endsAt).toISOString(),
    };
    this.portalService.createOffer(this.store.id, dto).subscribe({
      next: (offer) => {
        this.offers.push(offer);
        this.offerProductId = null;
        this.addingOffer = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.addingOffer = false;
        this.cd.detectChanges();
      },
    });
  }

  removeOffer(offerId: string): void {
    if (!this.store) return;
    if (!confirm('Vill du avsluta erbjudandet?')) return;
    this.portalService.deleteOffer(this.store.id, offerId).subscribe({
      next: () => {
        this.offers = this.offers.filter((o) => o.id !== offerId);
      },
      error: (err) => console.error('[Reseller] deleteOffer fel:', err.status),
    });
  }

  // ── Hjälpare ──────────────────────────────────────────────────────
  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target as FileReader).result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
