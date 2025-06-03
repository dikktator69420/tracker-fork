import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GreeterComponent } from './greeter.component';
import { AuthService } from '../../services/auth.service';

describe('GreeterComponent', () => {
  let component: GreeterComponent;
  let fixture: ComponentFixture<GreeterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn'], {
      currentUserValue: null,
    });

    await TestBed.configureTestingModule({
      imports: [GreeterComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(GreeterComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges here - we'll do it in each test after setup
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('should display greeting when user is logged in', () => {
    // Setup: User is logged in
    mockAuthService.currentUserSubject = {
      id: '1',
      username: 'Andreas',
      email: 'andreas@test.com',
    };
    mockAuthService.isLoggedIn.and.returnValue(true);

    // Initialize component
    fixture.detectChanges();

    expect(component.username).toBe('Andreas');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Hello again Andreas!'
    );
  });

  it('should display greeting from localStorage when user is not logged in', () => {
    // Setup: User not logged in but username in localStorage
    localStorage.setItem('lastUsername', 'Andreas');
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.currentUserSubject = null;

    // Initialize component
    fixture.detectChanges();

    expect(component.username).toBe('Andreas');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Hello again Andreas!'
    );
  });

  it('should not display greeting when no user data available', () => {
    // Setup: No user logged in and no localStorage
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.currentUserSubject = null;

    // Initialize component
    fixture.detectChanges();

    expect(component.username).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')).toBeNull();
  });
});
