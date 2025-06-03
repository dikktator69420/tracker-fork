import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TrackerComponent } from './tracker.component';
import { LocationService } from '../../services/location.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('TrackerComponent', () => {
  let component: TrackerComponent;
  let fixture: ComponentFixture<TrackerComponent>;
  let mockLocationService: jasmine.SpyObj<LocationService>;

  beforeEach(async () => {
    mockLocationService = jasmine.createSpyObj('LocationService', [
      'getCurrentPosition',
      'saveLocation',
    ]);

    await TestBed.configureTestingModule({
      imports: [TrackerComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: LocationService, useValue: mockLocationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save location successfully', () => {
    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 48.2082,
        longitude: 16.3738,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    component.currentPosition = mockPosition;
    mockLocationService.saveLocation.and.returnValue(of({}));

    component.saveLocation();

    expect(mockLocationService.saveLocation).toHaveBeenCalledWith(
      48.2082,
      16.3738
    );
    expect(component.message).toBe('Location saved successfully!');
    expect(component.savingLocation).toBeFalse();
  });

  it('should handle save location error', () => {
    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 48.2082,
        longitude: 16.3738,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    component.currentPosition = mockPosition;
    const errorResponse = { error: { message: 'Failed to save' } };
    mockLocationService.saveLocation.and.returnValue(
      throwError(() => errorResponse)
    );

    component.saveLocation();

    expect(component.errorMessage).toBe('Failed to save');
    expect(component.savingLocation).toBeFalse();
  });

  it('should show error when no position available for saving', () => {
    component.currentPosition = null;

    component.saveLocation();

    expect(component.errorMessage).toBe(
      'Unable to save: Location not available'
    );
    expect(mockLocationService.saveLocation).not.toHaveBeenCalled();
  });
});
