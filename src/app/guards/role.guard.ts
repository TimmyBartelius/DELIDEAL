import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }

    const role = auth.getUserRole();
    if (allowedRoles.includes(role)) {
      return true;
    }

    // Inloggad men fel roll – skicka till rätt plats
    if (role === 'merchant') {
      router.navigate(['/reseller']);
    } else if (role === 'admin') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  };
};
