// tracker-app/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, tap, delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Location Tracker';

  isAuthenticated$: Observable<boolean>;
  user$: Observable<any>;
  isLoading$: Observable<boolean>;
  
  // Combined observable for better state management
  authState$: Observable<{
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
  }>;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.user$ = this.authService.user$;
    this.isLoading$ = this.authService.isLoading$;
    
    // Create combined auth state observable
    this.authState$ = combineLatest([
      this.isAuthenticated$,
      this.isLoading$,
      this.user$
    ]).pipe(
      map(([isAuthenticated, isLoading, user]) => ({
        isAuthenticated,
        isLoading,
        user
      })),
      tap(state => console.log('🔍 Auth State Update:', state))
    );
  }

  ngOnInit(): void {
    console.log('🚀 App Component Initialized');
    
    // Handle authentication state changes with better timing
    this.authState$.pipe(
      // Wait a bit for Auth0 to fully initialize
      delay(100),
      filter(state => !state.isLoading) // Only proceed when loading is complete
    ).subscribe(({ isAuthenticated, user }) => {
      console.log('🔐 Auth state stabilized:', { isAuthenticated, hasUser: !!user });
      
      if (isAuthenticated && user) {
        console.log('✅ User is fully authenticated:', user.email);
        
        // Test token availability
        this.authService.getAccessTokenSilently().subscribe({
          next: (token) => {
            console.log('🎫 Access token available:', token ? 'Yes' : 'No');
            
            // If user is on login page and authenticated, redirect to tracker
            const currentUrl = this.router.url;
            if (currentUrl === '/login' || currentUrl === '/' || currentUrl === '/callback') {
              console.log('🔄 Redirecting authenticated user to tracker');
              this.router.navigate(['/tracker']);
            }
          },
          error: (error) => {
            console.error('❌ Token error:', error);
          }
        });
        
      } else if (!isAuthenticated) {
        console.log('❌ User is not authenticated');
        
        // Only redirect to login if not on auth-related pages
        const currentUrl = this.router.url;
        const authPages = ['/login', '/callback', '/error'];
        const isOnAuthPage = authPages.some(page => currentUrl.startsWith(page));
        
        if (!isOnAuthPage) {
          console.log('🔄 Redirecting unauthenticated user to login');
          this.router.navigate(['/login']);
        }
      }
    });

    // Handle errors separately
    this.authService.error$.subscribe(error => {
      if (error) {
        console.error('🚨 Auth0 Error:', error);
        this.router.navigate(['/error']);
      }
    });
  }

  login(): void {
    console.log('🔑 Starting login process');
    this.authService.loginWithRedirect();
  }

  logout(): void {
    console.log('👋 Starting logout process');
    this.authService.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }

  navigateTo(route: string): void {
    console.log('🧭 Navigating to:', route);
    this.router.navigate([route]);
  }

  // Debug method - you can remove this in production
  debugAuthState(): void {
    this.authService.getAccessTokenSilently().subscribe({
      next: (token) => {
        console.log('🔍 Debug - Current token:', token);
        console.log('🔍 Debug - Token length:', token?.length || 0);
      },
      error: (error) => {
        console.error('🔍 Debug - Token error:', error);
      }
    });
  }
}