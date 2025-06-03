import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          <div class="callback-content">
            <mat-spinner diameter="40"></mat-spinner>
            <h3>Completing Authentication</h3>
            <p>Please wait while we process your login...</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 200px);
        padding: 20px;
      }

      .callback-card {
        max-width: 400px;
        width: 100%;
      }

      .callback-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
        text-align: center;
      }

      h3 {
        margin: 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    `,
  ],
})
export class CallbackComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Auth0 automatically handles the callback
    // Redirect to tracker once authentication is complete
    this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.router.navigate(['/tracker']);
      }
    });

    // Handle errors
    this.authService.error$.subscribe((error: any) => {
      if (error) {
        console.error('Authentication error:', error);
        this.router.navigate(['/error']);
      }
    });
  }
}
