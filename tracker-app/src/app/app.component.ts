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
import { Observable } from 'rxjs';

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

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.user$ = this.authService.user$;
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    // Handle authentication state changes
    this.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      console.log('🔐 Authentication state changed:', isAuthenticated);
      
      if (isAuthenticated) {
        console.log('✅ User is authenticated');
        // If user is on login page and authenticated, redirect to tracker
        if (this.router.url === '/login' || this.router.url === '/') {
          console.log('🔄 Redirecting authenticated user to tracker');
          this.router.navigate(['/tracker']);
        }
      } else {
        console.log('❌ User is not authenticated');
        // Only redirect to login if not on callback or error pages
        const currentUrl = this.router.url;
        if (currentUrl !== '/login' && 
            currentUrl !== '/callback' && 
            currentUrl !== '/error' &&
            !currentUrl.startsWith('/callback')) {
          console.log('🔄 Redirecting unauthenticated user to login');
          this.router.navigate(['/login']);
        }
      }
    });

    // Debug user info
    this.user$.subscribe(user => {
      if (user) {
        console.log('👤 User info:', user);
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
}