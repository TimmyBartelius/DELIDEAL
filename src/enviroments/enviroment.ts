import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment: Environment = {
  production: false,
  application: {
    baseUrl,
    name: 'MyApp',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:5001',
    redirectUri: baseUrl,
    clientId: 'MyApp_App',
    responseType: 'code',
    scope: 'offline_access MyApp',
    requireHttps: false,
  },
  apis: {
    default: {
      url: 'https://localhost:5001',
      rootNamespace: 'MyApp',
    },
  },
};
