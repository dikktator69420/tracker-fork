import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TrackerComponent } from './components/tracker/tracker.component';
import { ListComponent } from './components/list/list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CallbackComponent } from './components/callback/callback.component';
import { ErrorComponent } from './components/error/error.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'tracker', component: TrackerComponent, canActivate: [authGuard] },
  { path: 'list', component: ListComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' },
];
