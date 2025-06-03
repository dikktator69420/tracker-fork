import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    sex: 'male',
    address: '123 Main St',
    postalCode: '12345',
    city: 'Test City',
    country: 'Test Country',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user and store in session storage', () => {
    service.login('testuser', 'password').subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(sessionStorage.getItem('currentUser')).toBe(
        JSON.stringify(mockUser)
      );
      expect(localStorage.getItem('lastUsername')).toBe('testuser');
    });

    const req = httpMock.expectOne('/users/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'testuser',
      password: 'password',
    });
    req.flush(mockUser);
  });

  it('should register user and store username', () => {
    service
      .register('newuser', 'password', 'new@example.com')
      .subscribe((response) => {
        expect(response).toBe('success');
        expect(localStorage.getItem('lastUsername')).toBe('newuser');
      });

    const req = httpMock.expectOne('/users/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'newuser',
      password: 'password',
      email: 'new@example.com',
    });
    req.flush('success');
  });

  it('should logout user and clear session storage', () => {
    // First set a user
    sessionStorage.setItem('currentUser', JSON.stringify(mockUser));
    service['currentUserSubject'].next(mockUser);

    service.logout();

    expect(sessionStorage.getItem('currentUser')).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });

  it('should restore user from session storage on init', () => {
    sessionStorage.setItem('currentUser', JSON.stringify(mockUser));

    // Create new service instance to test constructor
    const newService = new AuthService(TestBed.inject(HttpClient));

    expect(newService.currentUserValue).toEqual(mockUser);
  });

  it('should update profile with correct field mapping', () => {
    service['currentUserSubject'].next(mockUser);

    const updateData = {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
    };

    service.updateProfile(updateData).subscribe();

    const req = httpMock.expectOne('/users/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      sex: undefined,
      address: undefined,
      postalCode: undefined,
      city: undefined,
      country: undefined,
    });
    req.flush({});
  });

  it('should return correct login status', () => {
    expect(service.isLoggedIn()).toBeFalse();

    service['currentUserSubject'].next(mockUser);
    expect(service.isLoggedIn()).toBeTrue();
  });
});
