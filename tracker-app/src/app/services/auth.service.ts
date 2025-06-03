import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, map, switchMap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserProfile {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  updated_at?: string;
  // Custom app metadata
  app_metadata?: {
    role?: string;
    permissions?: string[];
  };
  user_metadata?: {
    preferences?: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth0: Auth0Service, private http: HttpClient) {}

  // Auth0 authentication observables
  get isAuthenticated$(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }

  get user$(): Observable<UserProfile | null | undefined> {
    return this.auth0.user$;
  }

  get isLoading$(): Observable<boolean> {
    return this.auth0.isLoading$;
  }

  get error$(): Observable<Error | null> {
    return this.auth0.error$;
  }

  // Authentication methods
  login(): void {
    this.auth0.loginWithRedirect();
  }

  loginWithPopup(): Observable<void> {
    return this.auth0.loginWithPopup();
  }

  logout(): void {
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  // Token management
  getAccessToken(): Observable<string> {
    return this.auth0.getAccessTokenSilently();
  }

  getAccessTokenWithOptions(options: any): Observable<string> {
    return this.auth0.getAccessTokenSilently(options);
  }

  // User profile management
  getCurrentUser(): Observable<UserProfile | null> {
    return this.isAuthenticated$.pipe(
      switchMap((isAuthenticated: any) => {
        if (isAuthenticated) {
          return this.user$ as Observable<UserProfile>;
        }
        return of(null);
      })
    );
  }

  updateUserMetadata(metadata: any): Observable<UserProfile> {
    return this.getAccessToken().pipe(
      switchMap((token: any) => {
        return this.http.patch<UserProfile>('/api/user/metadata', metadata, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
    );
  }

  // Role and permission checking
  hasRole(role: string): Observable<boolean> {
    return this.user$.pipe(
      map((user: { app_metadata: { role: string } }) => {
        if (!user?.app_metadata?.role) return false;
        return user.app_metadata.role === role;
      })
    );
  }

  hasPermission(permission: string): Observable<boolean> {
    return this.user$.pipe(
      map((user: { app_metadata: { permissions: string | string[] } }) => {
        if (!user?.app_metadata?.permissions) return false;
        return user.app_metadata.permissions.includes(permission);
      })
    );
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole('admin');
  }

  canManageLocations(): Observable<boolean> {
    return this.hasPermission('manage:locations');
  }

  // Helper methods
  getUserId(): Observable<string | null> {
    return this.user$.pipe(map((user: string) => user?.sub || null));
  }

  getUserEmail(): Observable<string | null> {
    return this.user$.pipe(map((user: { email: any }) => user?.email || null));
  }

  getUserName(): Observable<string | null> {
    return this.user$.pipe(
      map(
        (user: { name: any; nickname: any }) =>
          user?.name || user?.nickname || null
      )
    );
  }
}
