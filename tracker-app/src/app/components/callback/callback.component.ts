import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth0/auth0-angular';
import { combineLatest, timer } from 'rxjs';
import { filter, switchMap, takeUntil, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
            <h3>{{ statusMessage }}</h3>
            <p>{{ statusDetail }}</p>
            
            <!-- Debug info (remove in production) -->
            <div class="debug-info" *ngIf="showDebug">
              <small>
                <strong>Debug Info:</strong><br>
                Loading: {{ (authService.isLoading$ | async) }}<br>
                Authenticated: {{ (authService.isAuthenticated$ | async) }}<br>
                Has User: {{ !!(user$ | async) }}<br>
                Has Error: {{ !!(authService.error$ | async) }}
              </small>
            </div>
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
        max-width: 500px;
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
      
      .debug-info {
        margin-top: 20px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        text-align: left;
      }
    `,
  ],
})
export class CallbackComponent implements OnInit {
  statusMessage = 'Completing Authentication';
  statusDetail = 'Please wait while we process your login...';
  showDebug = !environment.production; // Show debug in development
  user$ = this.authService.user$;
  
  constructor(
    public authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔄 Callback component initialized');
    
    // Set up a timeout to prevent infinite waiting
    const timeout$ = timer(30000); // 30 second timeout
    
    // Wait for Auth0 to complete the authentication process
    combineLatest([
      this.authService.isAuthenticated$,
      this.authService.isLoading$,
      this.authService.error$
    ]).pipe(
      takeUntil(timeout$),
      filter(([isAuthenticated, isLoading, error]) => {
        console.log('🔍 Callback state:', { isAuthenticated, isLoading, error: !!error });
        
        if (error) {
          console.error('❌ Auth error in callback:', error);
          this.statusMessage = 'Authentication Error';
          this.statusDetail = 'Something went wrong during login. Redirecting...';
          
          setTimeout(() => {
            this.router.navigate(['/error']);
          }, 2000);
          
          return true; // Stop waiting
        }
        
        if (!isLoading) {
          if (isAuthenticated) {
            console.log('✅ Authentication completed successfully');
            this.statusMessage = 'Success!';
            this.statusDetail = 'Authentication completed. Redirecting to tracker...';
            
            // Wait a bit longer to ensure token is available
            setTimeout(() => {
              // Test if token is available before redirecting
              this.authService.getAccessTokenSilently().subscribe({
                next: (token) => {
                  console.log('🎫 Token available, redirecting to tracker');
                  this.router.navigate(['/tracker']);
                },
                error: (tokenError) => {
                  console.error('❌ Token not available yet:', tokenError);
                  // Try again with a longer delay
                  setTimeout(() => {
                    this.router.navigate(['/tracker']);
                  }, 2000);
                }
              });
            }, 1000);
            
            return true; // Stop waiting
          } else {
            console.log('❌ Authentication failed');
            this.statusMessage = 'Authentication Failed';
            this.statusDetail = 'Login was not successful. Redirecting to login...';
            
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
            
            return true; // Stop waiting
          }
        }
        
        return false; // Keep waiting
      })
    ).subscribe();
    
    // Handle timeout
    timeout$.subscribe(() => {
      console.log('⏰ Callback timeout reached');
      this.statusMessage = 'Timeout';
      this.statusDetail = 'Authentication is taking longer than expected. Redirecting...';
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    });
  }
}