// Byt ut URL:erna nedan mot dina faktiska Render-service-namn efter deploy
export const environment = {
  production: true,
  application: {
    baseUrl: 'https://delideal-frontend.onrender.com',
    name: 'MyApp',
    logoUrl: '',
  },
  apis: {
    default: {
      url: 'https://delideal-backend.onrender.com',
      rootNamespace: 'MyApp',
    },
  },
};
