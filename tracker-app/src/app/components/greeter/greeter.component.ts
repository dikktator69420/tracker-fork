import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-greeter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './greeter.component.html',
  styleUrls: ['./greeter.component.scss'],
})
export class GreeterComponent implements OnInit {
  username: string | undefined | null = undefined;

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
