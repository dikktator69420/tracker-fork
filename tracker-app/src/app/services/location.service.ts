import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, combineLatest } from 'rxjs';
import { catchError, tap, switchMap, filter, take, delay, map } from 'rxjs/operators';
import { Location } from '../models/location.model';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  saveLocation(latitude: number, longitude: number): Observable<Location> {
    console.log('📍 Saving location:', { latitude, longitude });
    
    const locationData = {
      latitude,
      longitude,
      time: new Date(),
    };
    
    console.log('📤 Sending location data:', locationData);
    
    // Wait for authentication to be ready before making the request
    return this.waitForAuth().pipe(
      switchMap(() => {
        console.log('🔐 Auth ready, making location save request');
        return this.http.post<Location>(`${this.apiUrl}/location`, locationData);
      }),
      tap(result => console.log('✅ Location saved:', result)),
      catchError(this.handleError.bind(this))
    );
  }

  getLocations(): Observable<Location[]> {
    console.log('📋 Getting locations...');
    
    // Wait for authentication to be ready before making the request
    return this.waitForAuth().pipe(
      switchMap(() => {
        console.log('🔐 Auth ready, making get locations request');
        return this.http.get<Location[]>(`${this.apiUrl}/locations`);
      }),
      tap(locations => console.log('✅ Retrieved locations:', locations.length)),
      catchError(this.handleError.bind(this))
    );
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          console.log('📍 Got current position:', position.coords);
          resolve(position);
        },
        (error: GeolocationPositionError) => {
          let message = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          console.error('❌ Geolocation error:', message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  /**
   * Wait for Auth0 to be ready and authenticated before making API calls
   */
  private waitForAuth(): Observable<boolean> {
    return combineLatest([
      this.authService.isAuthenticated$,
      this.authService.isLoading$
    ]).pipe(
      filter(([isAuthenticated, isLoading]) => {
        console.log('🔍 Auth state check:', { isAuthenticated, isLoading });
        // Wait until loading is complete and user is authenticated
        return !isLoading && isAuthenticated;
      }),
      take(1), // Take only the first time conditions are met
      delay(100), // Small delay to ensure token is available
      map(() => true), // Map to boolean since we filtered for success
      tap(() => console.log('✅ Auth is ready for API calls'))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ HTTP Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication required. Please log in again.';
      console.log('🔓 Authentication error detected');
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden. Invalid or expired token.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}