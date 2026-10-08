import { registerAs } from '@nestjs/config';

export default registerAs('openapi', () => ({
  title: 'Job Hunter API',
  version: '1.0',
  description: 'This API exposes all endpoints (job hunter)',
  termsOfService: 'https://fake.vn/donate',

  contact: {
    email: 'hoangto@gmail.com',
    name: 'Hoang',
    url: 'https://hoangtofake.vn',
  },

  license: {
    name: 'MIT License',
    url: 'https://choosealicense.com/licenses/mit/',
  },

  servers: [
    {
      url: 'http://localhost:90',
      description: 'Server URL in Development environment',
    },
    {
      url: 'https://fake.vn',
      description: 'Server URL in Production environment',
    },
  ],

  security: {
    name: 'Bearer Authentication',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
}));
