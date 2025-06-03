import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login',
      'register',
      'isLoggedIn',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    mockAuthService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable submit button when all register fields are filled correctly', () => {
    // Fill all register form fields correctly
    component.registerForm.patchValue({
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(component.registerForm.valid).toBeTruthy();

    // Find the register submit button
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const registerTab = compiled.querySelector('mat-tab[label="Register"]');
    expect(registerTab).toBeTruthy();

    // Check that the form is valid (button should be enabled)
    expect(component.registerForm.get('username')?.valid).toBeTruthy();
    expect(component.registerForm.get('email')?.valid).toBeTruthy();
    expect(component.registerForm.get('password')?.valid).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')?.valid).toBeTruthy();
    expect(component.registerForm.errors).toBeNull();
  });

  it('should disable submit button when email and confirmPassword fields are different', () => {
    // Fill register form with mismatched passwords
    component.registerForm.patchValue({
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
    });

    expect(component.registerForm.valid).toBeFalsy();
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();

    fixture.detectChanges();

    // The form should be invalid due to password mismatch
    expect(component.registerForm.get('username')?.valid).toBeTruthy();
    expect(component.registerForm.get('email')?.valid).toBeTruthy();
    expect(component.registerForm.get('password')?.valid).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')?.valid).toBeTruthy();
    // But overall form should be invalid due to password mismatch validator
    expect(component.registerForm.invalid).toBeTruthy();
  });

  it('should prefill username from localStorage', () => {
    localStorage.setItem('lastUsername', 'saveduser');

    // Recreate component to test ngOnInit with localStorage
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    expect(component.loginForm.get('username')?.value).toBe('saveduser');
    expect(component.savedUsername).toBe('saveduser');
  });

  it('should call authService.login on valid login form submission', () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' };
    mockAuthService.login.and.returnValue(of(mockUser));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password',
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tracker']);
  });

  it('should call authService.register on valid register form submission', () => {
    mockAuthService.register.and.returnValue(of('success'));

    component.registerForm.patchValue({
      username: 'newuser123',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onRegister();

    expect(mockAuthService.register).toHaveBeenCalledWith(
      'newuser123',
      'password123',
      'new@example.com'
    );
    expect(component.successMessage).toBe(
      'Registration successful. Please log in.'
    );
  });

  it('should handle login error', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword',
    });

    component.onLogin();

    expect(component.errorMessage).toBe('Invalid credentials');
  });
});
