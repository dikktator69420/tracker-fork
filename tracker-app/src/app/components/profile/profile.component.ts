// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with empty groups
    this.profileForm = this.formBuilder.group({
      systemData: this.formBuilder.group({}),
      personalData: this.formBuilder.group({}),
      addressData: this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/map']);
      return;
    }

    this.user = this.authService.currentUserValue;
    this.initForm();
  }

  initForm(): void {
    // Create nested form groups with validation
    this.profileForm = this.formBuilder.group({
      systemData: this.formBuilder.group({
        username: [{ value: this.user?.username, disabled: true }],
        email: [this.user?.email, [Validators.required, Validators.email]],
      }),
      personalData: this.formBuilder.group({
        firstname: [this.user?.firstname || ''],
        lastname: [this.user?.lastname || ''],
        sex: [this.user?.sex || ''],
      }),
      addressData: this.formBuilder.group({
        address: [this.user?.address || ''],
        postalCode: [this.user?.postalCode || ''],
        city: [this.user?.city || ''],
        country: [this.user?.country || ''],
      }),
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Combine form values from all groups
    const formValues = {
      ...this.profileForm.get('systemData')?.value,
      ...this.profileForm.get('personalData')?.value,
      ...this.profileForm.get('addressData')?.value,
    };

    // Username is disabled in form, so add it back
    formValues.username = this.user?.username;

    this.authService.updateProfile(formValues).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully';
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to update profile. Please try again.';
        this.loading = false;
      },
    });
  }
}
