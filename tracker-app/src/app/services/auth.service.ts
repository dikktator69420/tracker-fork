// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in (from sessionStorage)
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      this.currentUserSubject.next(JSON.parse(sessionUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>('/users/login', { username, password }).pipe(
      tap((user) => {
        // Store user in both localStorage (for username only) and sessionStorage (for full user object)
        localStorage.setItem('lastUsername', username);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(
    username: string,
    password: string,
    email: string
  ): Observable<string> {
    return this.http.post<string>('/users/register', {
      username,
      password,
      email,
    });
  }

  logout() {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`/users/update/${this.currentUserValue?.id}`, userData)
      .pipe(
        tap((updatedUser: User) => {
          const user = { ...this.currentUserValue, ...updatedUser } as User;
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
}
