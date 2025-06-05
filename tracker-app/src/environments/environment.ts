export const environment = {
  production: false,
  auth0: {
    domain: 'dev-xxjgz6slv15o564e.eu.auth0.com',
    clientId: 'lYsEzLmPvP5AB3jj8hM2OiFoxNsXunuR',
    authorizationParams: {
      redirect_uri: 'http://localhost:4200/callback',
      audience: 'https://tracker-api',
      scope: 'openid profile email offline_access read:locations write:locations',
    },
    // Improved token handling - remove cacheLocation for now to avoid TS error
    useRefreshTokens: true,
    errorPath: '/error',
    httpInterceptor: {
      allowedList: [
        {
          uri: 'http://localhost:3000/users/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://tracker-api',
              scope: 'read:locations write:locations',
            },
            // Add timeout and retry logic
            timeoutInSeconds: 60,
          },
        },
        // Also protect any /api routes if you add them later
        {
          uri: 'http://localhost:3000/api/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://tracker-api',
              scope: 'read:locations write:locations',
            },
            timeoutInSeconds: 60,
          },
        },
      ],
    },
    // Add better error handling
    skipRedirectCallback: false,
  },
};