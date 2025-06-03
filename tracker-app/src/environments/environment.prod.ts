export const environment = {
  production: true,
  auth0: {
    domain: 'fx0fip6dxo84kn1p.com',
    clientId: 'fx0fip6dxo84kn1p',
    authorizationParams: {
      redirect_uri: 'https://your-production-domain.com/callback',
      audience: 'https://tracker-api',
      scope: 'openid profile email offline_access',
    },
    errorPath: '/error',
    httpInterceptor: {
      allowedList: [
        {
          uri: 'https://your-api-domain.com/api/*',
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
