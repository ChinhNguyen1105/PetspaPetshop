import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:91',
  ],

  allowedMethods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
    'PATCH',
  ],

  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Accept',
    'x-no-retry',
  ],

  allowCredentials: true,

  maxAge: 3600,
}));
