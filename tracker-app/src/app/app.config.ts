import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Auth0 imports
import { provideAuth0 } from '@auth0/auth0-angular';
import { AuthHttpInterceptor } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthHttpInterceptor])),
    provideAnimations(),
    provideAuth0(environment.auth0),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      MatCardModule,
      MatInputModule,
      MatButtonModule,
      MatFormFieldModule,
      MatTabsModule,
      MatListModule,
      MatToolbarModule,
      MatIconModule,
      MatSelectModule,
      MatProgressSpinnerModule,
      MatSnackBarModule
    ),
  ],
};
