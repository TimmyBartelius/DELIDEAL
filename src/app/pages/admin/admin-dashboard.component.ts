import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  AdminService,
  CreateMerchantAccountDto,
  UserProfileModel,
} from '../../services/admin.service';
import { MerchantApi } from '../../shared/models/merchant-api.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'merchants' | 'customers' | 'all' = 'merchants';
  loading = false;
  loadError: string | null = null;

  // ── Alla användare ───────────────────────────────────────────────
  allUsers: UserProfileModel[] = [];

  // ── Återförsäljare ───────────────────────────────────────────────
  merchantUsers: UserProfileModel[] = [];
  merchants: MerchantApi[] = [];

  showCreateForm = true;
  createForm: CreateMerchantAccountDto = {
    userName: '',
    email: '',
    password: '',
    storeName: '',
    storeAddress: '',
    storePhone: '',
  };
  creating = false;
  createError: string | null = null;
  createSuccess: string | null = null;

  // ── Kunder ───────────────────────────────────────────────────────
  customers: UserProfileModel[] = [];

  constructor(
    public authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.loadError = null;
    let merchantsDone = false,
      merchantUsersDone = false,
      customersDone = false,
      allUsersDone = false;

    // Timeout: om något anrop hänger > 10 sek, avbryt laddning och visa fel
    const timeoutHandle = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.loadError =
          'Laddningen tog för lång tid. Kontrollera att backend körs och att du har admin-behörighet.';
        this.cd.detectChanges();
      }
    }, 10000);

    const checkAllDone = () => {
      if (merchantsDone && merchantUsersDone && customersDone && allUsersDone) {
        clearTimeout(timeoutHandle);
        this.loading = false;
        this.cd.detectChanges();
      }
    };

    this.adminService.getAllUsers().subscribe({
      next: (u) => {
        this.allUsers = u;
        allUsersDone = true;
        checkAllDone();
      },
      error: (err) => {
        console.error('[Admin] getAllUsers fel:', err.status, err.error || err.message);
        allUsersDone = true;
        checkAllDone();
      },
    });

    this.adminService.getMerchantUsers().subscribe({
      next: (u) => {
        this.merchantUsers = u;
        merchantUsersDone = true;
        checkAllDone();
      },
      error: (err) => {
        this.loadError =
          'Kunde inte hämta återförsäljare: ' +
          (err.error?.message ||
            err.error ||
            err.message ||
            err.statusText ||
            `HTTP ${err.status}`);
        console.error('[Admin] getMerchantUsers fel:', err.status, err.error || err.message);
        merchantUsersDone = true;
        checkAllDone();
      },
    });
    this.adminService.getMerchants().subscribe({
      next: (m) => {
        this.merchants = m;
        merchantsDone = true;
        checkAllDone();
      },
      error: (err) => {
        this.loadError =
          'Kunde inte hämta butiker: ' +
          (err.error?.message ||
            err.error ||
            err.message ||
            err.statusText ||
            `HTTP ${err.status}`);
        console.error('[Admin] getMerchants fel:', err.status, err.error || err.message);
        merchantsDone = true;
        checkAllDone();
      },
    });
    this.adminService.getCustomers().subscribe({
      next: (c) => {
        this.customers = c;
        customersDone = true;
        checkAllDone();
      },
      error: (err) => {
        this.loadError =
          'Kunde inte hämta kunder: ' +
          (err.error?.message ||
            err.error ||
            err.message ||
            err.statusText ||
            `HTTP ${err.status}`);
        console.error('[Admin] getCustomers fel:', err.status, err.error || err.message);
        customersDone = true;
        checkAllDone();
      },
    });
  }

  // ── Skapa merchant-konto ─────────────────────────────────────────
  createMerchant(): void {
    if (
      !this.createForm.userName ||
      !this.createForm.email ||
      !this.createForm.password ||
      !this.createForm.storeName
    ) {
      this.createError = 'Fyll i alla obligatoriska fält (markerade med *).';
      return;
    }
    this.creating = true;
    this.createError = null;
    this.createSuccess = null;

    this.adminService.createMerchantAccount(this.createForm).subscribe({
      next: (res) => {
        this.creating = false;
        this.merchantUsers.push(res.user);
        this.merchants.push(res.merchant);
        this.createForm = {
          userName: '',
          email: '',
          password: '',
          storeName: '',
          storeAddress: '',
          storePhone: '',
        };
        this.createSuccess = `Kontot för "${res.user?.userName ?? 'ny merchant'}" skapades!`;
        this.cd.detectChanges();
        setTimeout(() => {
          this.createSuccess = null;
          this.cd.detectChanges();
        }, 6000);
      },
      error: (err) => {
        this.creating = false;
        const msg = err.error;
        if (typeof msg === 'string' && msg.length > 0) {
          this.createError = msg;
        } else {
          this.createError = `Fel ${err.status}: ${err.statusText || 'Något gick fel.'}`;
        }
        this.cd.detectChanges();
      },
    });
  }

  // ── Ta bort merchant (konto + butik) ─────────────────────────────
  deleteMerchant(userId: string, merchantId: string | undefined, userName: string): void {
    if (!confirm(`Ta bort kontot för ${userName} och dess butik? Detta går inte att ångra.`))
      return;
    this.adminService
      .deleteUser(userId)
      .subscribe({ error: (err) => console.error('[Admin] deleteUser fel:', err.status) });
    if (merchantId)
      this.adminService
        .deleteMerchant(merchantId)
        .subscribe({ error: (err) => console.error('[Admin] deleteMerchant fel:', err.status) });
    this.merchantUsers = this.merchantUsers.filter((u) => u.id !== userId);
    this.merchants = this.merchants.filter((m) => m.id !== merchantId);
  }

  // ── Ta bort kund ─────────────────────────────────────────────────
  deleteCustomer(id: string, name: string): void {
    if (!confirm(`Ta bort kunden ${name}? Detta går inte att ångra.`)) return;
    this.adminService
      .deleteUser(id)
      .subscribe({ error: (err) => console.error('[Admin] deleteCustomer fel:', err.status) });
    this.customers = this.customers.filter((c) => c.id !== id);
  }

  // ── Hjälpare: hitta butik för en merchant-user ────────────────────
  getMerchantStore(userId: string): MerchantApi | undefined {
    return this.merchants.find((m) => m.ownerId === userId);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
