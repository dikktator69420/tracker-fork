// src/app/components/tracker/tracker.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss'],
})
export class TrackerComponent implements OnInit, AfterViewInit {
  map!: L.Map;
  marker: L.Marker | null = null;
  currentPosition: GeolocationPosition | null = null;
  savingLocation = false;
  message = '';
  errorMessage = '';

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    // Add Leaflet CSS to the document
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.getCurrentLocation();
  }

  initMap(): void {
    // Create map with default view
    this.map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  getCurrentLocation(): void {
    this.locationService
      .getCurrentPosition()
      .then((position) => {
        this.currentPosition = position;
        const { latitude, longitude } = position.coords;

        // Update map view
        this.map.setView([latitude, longitude], 15);

        // Add marker for current position
        if (this.marker) {
          this.marker.setLatLng([latitude, longitude]);
        } else {
          this.marker = L.marker([latitude, longitude]).addTo(this.map);
        }

        this.marker.bindPopup('Your current location').openPopup();
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        this.errorMessage = `Error getting your location: ${error.message}`;
      });
  }

  saveLocation(): void {
    if (!this.currentPosition) {
      this.errorMessage = 'Unable to save: Location not available';
      return;
    }

    this.savingLocation = true;
    this.message = '';
    this.errorMessage = '';

    const { latitude, longitude } = this.currentPosition.coords;

    this.locationService.saveLocation(latitude, longitude).subscribe({
      next: () => {
        this.message = 'Location saved successfully!';
        this.savingLocation = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to save location. Please try again.';
        this.savingLocation = false;
      },
    });
  }

  refreshLocation(): void {
    this.getCurrentLocation();
  }
}
