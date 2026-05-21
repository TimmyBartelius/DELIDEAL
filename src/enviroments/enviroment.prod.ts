// Byt ut URL:erna nedan mot dina faktiska Render-service-namn efter deploy
export const environment = {
  production: true,
  application: {
    baseUrl: 'https://delideal.vercel.app', // uppdatera när frontend-servicen är skapad
    name: 'MyApp',
    logoUrl: '',
  },
  apis: {
    default: {
      url: 'https://delideal.onrender.com',
      rootNamespace: 'MyApp',
    },
  },
};
