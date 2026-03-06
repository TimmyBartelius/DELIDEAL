import { Environment } from '@abp/ng.core';

const baseUrl = 'https://myapp-frontend.onrender.com'; // Byt till riktig frontend-url vid deploy

export const environment: Environment = {
  production: true,
  application: {
    baseUrl,
    name: 'MyApp',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://myapp.com', // produktionsserver
    redirectUri: baseUrl,
    clientId: 'MyApp_App',
    responseType: 'code',
    scope: 'offline_access MyApp',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://myapp-backend.onrender.com', // produktions-API
      rootNamespace: 'MyApp',
    },
  },
};
