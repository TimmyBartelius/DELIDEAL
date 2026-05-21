// Byt ut URL:erna nedan mot dina faktiska Render-service-namn efter deploy
export const environment = {
  production: true,
  application: {
    baseUrl: 'https://YOUR-FRONTEND-SERVICE.onrender.com',
    name: 'MyApp',
    logoUrl: '',
  },
  apis: {
    default: {
      url: 'https://YOUR-BACKEND-SERVICE.onrender.com',
      rootNamespace: 'MyApp',
    },
  },
};
