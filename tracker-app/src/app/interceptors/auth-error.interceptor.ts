import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 HTTP Error Intercepted:', error);

      // Handle authentication errors
      if (error.status === 401) {
        console.log('🔓 Token expired or invalid, redirecting to login');
        
        // Show user-friendly message
        snackBar.open(
          'Your session has expired. Please log in again.', 
          'Close', 
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
        
        // Logout and redirect to login
        authService.logout({
          logoutParams: {
            returnTo: window.location.origin + '/login'
          }
        });
        
        return throwError(() => new Error('Authentication required'));
      }

      // Handle forbidden errors
      if (error.status === 403) {
        console.log('🚫 Access forbidden');
        snackBar.open(
          'Access denied. You do not have permission for this action.', 
          'Close', 
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      }

      // Handle network errors
      if (error.status === 0) {
        console.log('🌐 Network error');
        snackBar.open(
          'Network error. Please check your internet connection.', 
          'Close', 
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      }

      // Handle server errors
      if (error.status >= 500) {
        console.log('🔥 Server error');
        snackBar.open(
          'Server error. Please try again later.', 
          'Close', 
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      }

      return throwError(() => error);
    })
  );
};