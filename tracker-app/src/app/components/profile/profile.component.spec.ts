import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

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

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(
      'AuthService',
      ['isLoggedIn', 'updateProfile'],
      {
        currentUserValue: mockUser,
      }
    );
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    mockAuthService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    expect(
      component.profileForm.get('systemData')?.get('username')?.value
    ).toBe('testuser');
    expect(component.profileForm.get('systemData')?.get('email')?.value).toBe(
      'test@example.com'
    );
    expect(
      component.profileForm.get('personalData')?.get('firstname')?.value
    ).toBe('John');
    expect(
      component.profileForm.get('personalData')?.get('lastname')?.value
    ).toBe('Doe');
  });

  it('should navigate to map if user not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/map']);
  });

  it('should update profile successfully', () => {
    mockAuthService.updateProfile.and.returnValue(of({}));

    component.profileForm.patchValue({
      personalData: { firstname: 'Jane', lastname: 'Smith' },
    });

    component.onSubmit();

    expect(mockAuthService.updateProfile).toHaveBeenCalled();
    expect(component.successMessage).toBe('Profile updated successfully');
    expect(component.loading).toBeFalse();
  });

  it('should handle update profile error', () => {
    const errorResponse = { error: { message: 'Update failed' } };
    mockAuthService.updateProfile.and.returnValue(
      throwError(() => errorResponse)
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('Update failed');
    expect(component.loading).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    component.profileForm
      .get('systemData')
      ?.get('email')
      ?.setValue('invalid-email');

    component.onSubmit();

    expect(mockAuthService.updateProfile).not.toHaveBeenCalled();
  });
});
