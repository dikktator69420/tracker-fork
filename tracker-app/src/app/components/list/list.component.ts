// src/app/components/list/list.component.ts
import { Component, OnInit } from '@angular/core';
import { Location } from '../../models/location.model';
import { LocationService } from '../../services/location.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  locations: Location[] = [];
  map!: L.Map;
  loading = true;
  errorMessage = '';

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.fetchLocations();
  }

  fetchLocations(): void {
    this.loading = true;

    this.locationService.getLocations().subscribe({
      next: (locations: Location[]) => {
        this.locations = locations;
        this.loading = false;

        // Initialize map after we have locations
        setTimeout(() => {
          this.initMap();
          this.addLocationMarkers();
        }, 100);
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage =
          error.error?.message || 'Failed to fetch locations.';
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

    const bounds = L.latLngBounds();
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
