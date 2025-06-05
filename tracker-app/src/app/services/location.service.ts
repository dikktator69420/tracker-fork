import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';
import { Location } from '../models/location.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveLocation(latitude: number, longitude: number): Observable<Location> {
    console.log('📍 Saving location:', { latitude, longitude });
    
    return this.authService.getUserId().pipe(
      switchMap((userId: string | null) => {
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        console.log('👤 Using user ID:', userId);
        
        const locationData = {
          userid: userId,
          latitude,
          longitude,
          time: new Date(),
        };
        
        console.log('📤 Sending location data:', locationData);
        
        return this.http.post<Location>(`${this.apiUrl}/users/location`, locationData);
      })
    );
  }

  getLocations(): Observable<Location[]> {
    console.log('📋 Getting locations...');
    
    return this.authService.getUserId().pipe(
      switchMap((userId: string | null) => {
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        console.log('👤 Getting locations for user:', userId);
        
        return this.http.get<Location[]>(`${this.apiUrl}/users/locations/${encodeURIComponent(userId)}`);
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
}