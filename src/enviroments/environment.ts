import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment: Environment = {
  production: false,

  application: {
    baseUrl,
    name: 'MyApp',
    logoUrl: '',
  },

  apis: {
    default: {
      url: 'http://localhost:5101',
      rootNamespace: 'MyApp',
    },
  },
};
