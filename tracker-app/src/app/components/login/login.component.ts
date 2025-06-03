import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isLoading$: Observable<boolean>;
  error$: Observable<Error | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoading$ = this.authService.isLoading$;
    this.error$ = this.authService.error$;
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.router.navigate(['/tracker']);
      }
    });
  }

  login(): void {
    this.authService.login();
  }

  loginWithPopup(): void {
    this.authService.loginWithPopup().subscribe({
      next: () => {
        this.router.navigate(['/tracker']);
      },
      error: (error: any) => {
        console.error('Login failed:', error);
      },
    });
  }
}
