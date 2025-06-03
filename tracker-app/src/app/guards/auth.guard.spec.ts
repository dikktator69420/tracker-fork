import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters: any[]) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect when user is not logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/map']);
  });
});
