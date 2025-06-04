import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { Location } from '../models/location.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api'; // Updated to match backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveLocation(latitude: number, longitude: number): Observable<Location> {
    return this.authService.getUserId().pipe(
      switchMap((userId: string | null) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        // Updated endpoint to match backend
        return this.http.post<Location>(`${this.apiUrl}/users/location`, {
          latitude,
          longitude,
        });
      })
    );
  }

  getLocations(): Observable<Location[]> {
    return this.authService.getUserId().pipe(
      switchMap((userId: string | null) => {
        if (!userId) {
          return throwError(() => new Error('User not authenticated'));
        }

        // Updated endpoint to match backend
        return this.http.get<Location[]>(`${this.apiUrl}/users/locations/${userId}`);
      })
    );
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
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
}