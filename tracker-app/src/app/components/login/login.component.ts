// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  savedUsername: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with empty controls
    this.loginForm = this.formBuilder.group({});
    this.registerForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tracker']);
    }

    // Get the saved username from localStorage
    this.savedUsername = localStorage.getItem('lastUsername');

    this.initForms();
  }

  initForms(): void {
    // Login form with validation and pre-filled username
    this.loginForm = this.formBuilder.group({
      username: [this.savedUsername || '', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // Register form with validation
    this.registerForm = this.formBuilder.group(
      {
        username: ['', [Validators.required, Validators.minLength(6)]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            ),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(7)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/tracker']);
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage =
          error.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { username, password, email } = this.registerForm.value;
    this.authService.register(username, password, email).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Please log in.';
        // Store the username after successful registration
        localStorage.setItem('lastUsername', username);
        this.registerForm.reset();
      },
      error: (error: { error: { message: string } }) => {
        this.errorMessage =
          error.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
