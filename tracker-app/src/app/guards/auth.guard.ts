import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      console.log('🔐 Auth Guard - Is Authenticated:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login');
        router.navigate(['/login']);
        return false;
      }
      
      console.log('✅ Authenticated, allowing access');
      return true;
    })
  );
};