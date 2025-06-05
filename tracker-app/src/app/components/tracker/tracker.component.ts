// tracker-app/src/app/components/tracker/tracker.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss'],
})
export class TrackerComponent implements OnInit, AfterViewInit {
  map!: L.Map;
  marker: L.Marker | null = null;
  currentPosition: GeolocationPosition | null = null;
  savingLocation = false;
  gettingLocation = false;
  user$: Observable<UserProfile | null | undefined>;
  
  // Add missing properties
  message = '';
  errorMessage = '';

  constructor(
    private locationService: LocationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  ngAfterViewInit(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initMap();
      this.getCurrentLocation();
    }, 0);
  }

  initMap(): void {
    this.map = L.map('map').setView([48.2082, 16.3738], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const iconRetinaUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
    const iconUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
    const shadowUrl =
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

    const defaultIcon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = defaultIcon;
  }

  getCurrentLocation(): void {
  // Clear any existing messages first
  this.message = '';
  this.errorMessage = '';
  
  // Use setTimeout to prevent timing issues
  setTimeout(() => {
    this.gettingLocation = true;
  }, 0);

  this.locationService
    .getCurrentPosition()
    .then((position) => {
      this.currentPosition = position;
      const { latitude, longitude } = position.coords;

      this.map.setView([latitude, longitude], 15);

      if (this.marker) {
        this.marker.setLatLng([latitude, longitude]);
      } else {
        this.marker = L.marker([latitude, longitude]).addTo(this.map);
      }

      this.marker
        .bindPopup(
          `
        <b>Your Current Location</b><br>
        Lat: ${latitude.toFixed(6)}<br>
        Lng: ${longitude.toFixed(6)}<br>
        Accuracy: ${position.coords.accuracy.toFixed(2)}m
      `
        )
        .openPopup();

      this.gettingLocation = false;
      this.showSnackBar('Location found successfully!', 'success');
    })
    .catch((error) => {
      console.error('Error getting location:', error);
      this.gettingLocation = false;
      this.showSnackBar(`Error getting location: ${error.message}`, 'error');
    });
}

  saveLocation(): void {
    if (!this.currentPosition) {
      this.showSnackBar('No location available to save', 'error');
      return;
    }

    this.savingLocation = true;
    const { latitude, longitude } = this.currentPosition.coords;

    this.locationService.saveLocation(latitude, longitude).subscribe({
      next: () => {
        this.savingLocation = false;
        this.message = 'Location saved successfully!';
        this.errorMessage = '';
        this.showSnackBar('Location saved successfully!', 'success');
      },
      error: (error: any) => {
        console.error('Error saving location:', error);
        this.savingLocation = false;
        this.errorMessage = 'Failed to save location. Please try again.';
        this.message = '';
        this.showSnackBar('Failed to save location. Please try again.', 'error');
      },
    });
  }

  refreshLocation(): void {
    this.getCurrentLocation();
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
    });
  }
}