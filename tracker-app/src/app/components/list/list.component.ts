import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Location } from '../../models/location.model';
import { LocationService } from '../../services/location.service';
import { AuthService } from '@auth0/auth0-angular';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  locations: Location[] = [];
  map!: L.Map;
  loading = true;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private locationService: LocationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Wait for Auth0 to be ready before fetching data
    this.waitForAuthAndFetch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Wait for authentication to be complete before fetching locations
   */
  private waitForAuthAndFetch(): void {
    console.log('🔍 Waiting for authentication to complete...');
    
    combineLatest([
      this.authService.isAuthenticated$,
      this.authService.isLoading$
    ]).pipe(
      takeUntil(this.destroy$),
      filter(([isAuthenticated, isLoading]) => {
        console.log('🔍 Auth state:', { isAuthenticated, isLoading });
        // Only proceed when not loading and user is authenticated
        return !isLoading && isAuthenticated;
      }),
      switchMap(() => {
        console.log('✅ Auth ready, fetching locations...');
        return this.locationService.getLocations();
      })
    ).subscribe({
      next: (locations: Location[]) => {
        console.log('📍 Locations received:', locations);
        this.locations = locations;
        this.loading = false;
        this.errorMessage = '';

        // Initialize map after we have locations
        setTimeout(() => {
          this.initMap();
          this.addLocationMarkers();
        }, 100);
      },
      error: (error: any) => {
        console.error('❌ Error fetching locations:', error);
        this.errorMessage = error.message || 'Failed to fetch locations.';
        this.loading = false;
      }
    });
  }

  fetchLocations(): void {
    console.log('🔄 Manual refresh requested');
    this.loading = true;
    this.errorMessage = '';

    this.locationService.getLocations().subscribe({
      next: (locations: Location[]) => {
        this.locations = locations;
        this.loading = false;

        // Re-initialize map after refresh
        if (this.map) {
          this.map.remove();
        }
        setTimeout(() => {
          this.initMap();
          this.addLocationMarkers();
        }, 100);
      },
      error: (error: { message: string }) => {
        this.errorMessage = error.message || 'Failed to fetch locations.';
        this.loading = false;
      },
    });
  }

  initMap(): void {
    // Create map with default view
    this.map = L.map('locations-map');

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // If no locations, show the world map
    if (this.locations.length === 0) {
      this.map.setView([0, 0], 2);
    }
  }

  addLocationMarkers(): void {
    if (this.locations.length === 0) return;

    const bounds = L.latLngBounds([]);
    const markers: L.Marker[] = [];

    this.locations.forEach((location, index) => {
      const marker = L.marker([location.latitude, location.longitude]).addTo(
        this.map
      ).bindPopup(`
          <b>Location #${index + 1}</b><br>
          Lat: ${location.latitude.toFixed(6)}<br>
          Lng: ${location.longitude.toFixed(6)}<br>
          Time: ${new Date(location.time).toLocaleString()}
        `);

      markers.push(marker);
      bounds.extend([location.latitude, location.longitude]);
    });

    // Fit the map to show all markers
    if (markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleString();
  }
}