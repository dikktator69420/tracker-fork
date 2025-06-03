// tracker-app/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider'; // Add this import
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { UserProfile } from './services/auth.service';

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
    MatDividerModule, // Add this to imports
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // ... rest of the component stays the same
  title = 'Location Tracker';

  isAuthenticated$: Observable<boolean>;
  user$: Observable<UserProfile | null | undefined>;
  isLoading$: Observable<boolean>;

  constructor(public authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.user$ = this.authService.user$;
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        if (this.router.url === '/login' || this.router.url === '/') {
          this.router.navigate(['/tracker']);
        }
      } else {
        if (
          this.router.url !== '/login' &&
          this.router.url !== '/callback' &&
          this.router.url !== '/error'
        ) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}