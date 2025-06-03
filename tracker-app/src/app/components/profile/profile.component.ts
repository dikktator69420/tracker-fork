import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<UserProfile | null | undefined>;
  isLoading$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    // Profile data is automatically loaded by Auth0
  }

  updateProfile(): void {
    // Redirect to Auth0 Profile Management
    window.open('https://YOUR_AUTH0_DOMAIN/u/profile', '_blank');
  }

  viewAccessToken(): void {
    this.authService.getAccessToken().subscribe({
      next: (token: any) => {
        console.log('Access Token:', token);
        // In production, you might want to show this in a dialog instead
        alert('Access token logged to console (F12)');
      },
      error: (error: any) => {
        console.error('Error getting access token:', error);
      },
    });
  }
}
