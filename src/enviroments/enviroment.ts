import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment: Environment = {
  production: false,
  application: {
    baseUrl,
    name: 'MyApp',
    logoUrl: ''
  },
  oAuthConfig: {
    issuer: 'http://localhost:5000',
    redirectUri: baseUrl,
    clientId: 'MyApp_App',
    responseType: 'code',
    scope: 'offline_access MyApp',
    requireHttps: false
  },
  apis: {
    default: {
      url: 'http://localhost:5000',
      rootNamespace: 'MyApp'
    }
  }
};
