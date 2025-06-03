import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        auth.loginWithRedirect();
        return false;
      }
      return true;
    })
  );
};
