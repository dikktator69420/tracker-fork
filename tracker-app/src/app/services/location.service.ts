// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  saveLocation(latitude: number, longitude: number): Observable<Location> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.post<Location>('/users/location', {
      userid: userId,
      latitude,
      longitude,
      time: new Date(),
    });
  }

  getLocations(): Observable<Location[]> {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.get<Location[]>(`/users/locations/${userId}`);
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }
}
