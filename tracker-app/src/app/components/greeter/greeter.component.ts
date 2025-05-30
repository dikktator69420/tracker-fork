// src/app/components/greeter/greeter.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-greeter',
  templateUrl: './greeter.component.html',
  styleUrls: ['./greeter.component.scss'],
})
export class GreeterComponent implements OnInit {
  username: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      this.username = this.authService.currentUserValue?.username;
    } else {
      // Check if there's a stored username in localStorage
      this.username = localStorage.getItem('lastUsername');
    }
  }
}
