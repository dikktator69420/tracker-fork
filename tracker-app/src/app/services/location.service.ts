import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Location } from '../models/location.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api'; // Your backend API

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveLocation(latitude: number, longitude: number): Observable<Location> {
    return this.authService.getUserId().pipe(
      switchMap((userId: any) => {
        if (!userId) {
          throw new Error('User not authenticated');
        }

        return this.http.post<Location>(`${this.apiUrl}/locations`, {
          userId,
          latitude,
          longitude,
          time: new Date(),
        });
      })
    );
  }

  getLocations(): Observable<Location[]> {
    return this.authService.getUserId().pipe(
      switchMap((userId: any) => {
        if (!userId) {
          throw new Error('User not authenticated');
        }

        return this.http.get<Location[]>(`${this.apiUrl}/locations/${userId}`);
      })
    );
  }

  deleteLocation(locationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${locationId}`);
  }

  updateLocation(
    locationId: number,
    data: Partial<Location>
  ): Observable<Location> {
    return this.http.put<Location>(
      `${this.apiUrl}/locations/${locationId}`,
      data
    );
  }

  // Admin only - get all users' locations
  getAllLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/admin/locations`);
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      }
    });
  }
}
