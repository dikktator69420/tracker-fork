import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ListComponent } from './list.component';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models/location.model';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockLocationService: jasmine.SpyObj<LocationService>;

  beforeEach(async () => {
    mockLocationService = jasmine.createSpyObj('LocationService', [
      'getLocations',
    ]);

    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: LocationService, useValue: mockLocationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and display locations', () => {
    const mockLocations: Location[] = [
      {
        id: 1,
        userid: 1,
        latitude: 48.2082,
        longitude: 16.3738,
        time: new Date(),
      },
      { id: 2, userid: 1, latitude: 48.2, longitude: 16.37, time: new Date() },
    ];

    mockLocationService.getLocations.and.returnValue(of(mockLocations));

    component.fetchLocations();

    expect(component.locations).toEqual(mockLocations);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should handle fetch locations error', () => {
    const errorResponse = { error: { message: 'Failed to fetch' } };
    mockLocationService.getLocations.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchLocations();

    expect(component.locations).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to fetch');
  });

  it('should format date correctly', () => {
    const testDate = new Date('2023-01-01T12:00:00Z');
    const formattedDate = component.formatDate(testDate);

    expect(formattedDate).toBe(testDate.toLocaleString());
  });
});
