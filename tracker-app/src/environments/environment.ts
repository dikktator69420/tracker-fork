export const environment = {
  production: false,
  auth0: {
    domain: 'dev-fx0fip6dxo84kn1p.com',
    clientId: 'dev-fx0fip6dxo84kn1p',
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
