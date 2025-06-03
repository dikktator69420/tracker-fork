import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn" class="error-icon">error</mat-icon>
            <h2>Authentication Error</h2>
            <p>Something went wrong during the authentication process.</p>

            <div class="error-actions">
              <button mat-raised-button color="primary" (click)="tryAgain()">
                <mat-icon>refresh</mat-icon>
                Try Again
              </button>

              <button mat-stroked-button (click)="goHome()">
                <mat-icon>home</mat-icon>
                Go to Login
              </button>
            </div>

            <div class="error-help">
              <small>
                If the problem persists, please contact support or try clearing
                your browser cache.
              </small>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 200px);
        padding: 20px;
      }

      .error-card {
        max-width: 500px;
        width: 100%;
      }

      .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 20px;
        text-align: center;
      }

      .error-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      h2 {
        margin: 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        line-height: 1.5;
      }

      .error-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;

        button {
          min-width: 120px;

          mat-icon {
            margin-right: 4px;
          }
        }
      }

      .error-help {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;

        small {
          color: #666;
          line-height: 1.4;
        }
      }

      @media (max-width: 600px) {
        .error-actions {
          flex-direction: column;
          width: 100%;

          button {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class ErrorComponent {
  constructor(private authService: AuthService, private router: Router) {}

  tryAgain(): void {
    this.authService.login();
  }

  goHome(): void {
    this.router.navigate(['/login']);
  }
}
