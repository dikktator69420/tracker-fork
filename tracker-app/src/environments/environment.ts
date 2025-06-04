export const environment = {
  production: false,
  auth0: {
    domain: 'dev-xxjgz6slv15o564e.eu.auth0.com', // Replace with your domain
    clientId: 'lYsEzLmPvP5AB3jj8hM2OiFoxNsXunuR',      // Replace with your client ID
    authorizationParams: {
      redirect_uri: 'http://localhost:4200/callback',
      audience: 'https://tracker-api',
      scope: 'openid profile email offline_access',
    },
    errorPath: '/error',
    httpInterceptor: {
      allowedList: [
        {
          uri: 'http://localhost:3000/api/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://tracker-api',
              scope: 'read:locations write:locations',
            },
          },
        },
      ],
    },
  },
};