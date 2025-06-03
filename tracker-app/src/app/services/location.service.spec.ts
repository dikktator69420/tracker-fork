import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LocationService } from './location.service';
import { AuthService } from './auth.service';
import { Location } from '../models/location.model';

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
  const mockLocation: Location = {
    id: 1,
    userid: 1,
    latitude: 48.2082,
    longitude: 16.3738,
    time: new Date(),
  };

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: mockUser,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LocationService,
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save location', () => {
    service.saveLocation(48.2082, 16.3738).subscribe((location: any) => {
      expect(location).toEqual(mockLocation);
    });

    const req = httpMock.expectOne('/users/location');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.userid).toBe('1');
    expect(req.request.body.latitude).toBe(48.2082);
    expect(req.request.body.longitude).toBe(16.3738);
    req.flush(mockLocation);
  });

  it('should get locations', () => {
    const mockLocations: Location[] = [mockLocation];

    service.getLocations().subscribe((locations: any) => {
      expect(locations).toEqual(mockLocations);
    });

    const req = httpMock.expectOne('/users/locations/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockLocations);
  });

  it('should throw error when user not logged in for saveLocation', () => {
    mockAuthService.currentUserSubject = null;

    expect(() => service.saveLocation(48.2082, 16.3738)).toThrowError(
      'User not logged in'
    );
  });

  it('should throw error when user not logged in for getLocations', () => {
    mockAuthService.currentUserSubject = null;

    expect(() => service.getLocations()).toThrowError('User not logged in');
  });

  it('should get current position', async () => {
    const mockGeolocation = {
      getCurrentPosition: jasmine
        .createSpy('getCurrentPosition')
        .and.callFake((success) => {
          const mockPosition: GeolocationPosition = {
            coords: {
              latitude: 48.2082,
              longitude: 16.3738,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: function () {},
            },
            timestamp: Date.now(),
            toJSON: function () {},
          };
          success(mockPosition);
        }),
    };

    Object.defineProperty(window.navigator, 'navigator', {
      value: { geolocation: mockGeolocation },
      writable: true,
    });

    const position = await service.getCurrentPosition();
    expect(position.coords.latitude).toBe(48.2082);
    expect(position.coords.longitude).toBe(16.3738);
  });
});
