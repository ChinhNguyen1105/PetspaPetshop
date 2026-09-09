import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: (process.env.DB_TYPE || 'mysql') as 'mysql' | 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Only in development
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));

export const vnpayConfig = registerAs('vnpay', () => ({
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  sandboxUrl: process.env.VNPAY_SANDBOX_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
  notifyUrl: process.env.VNPAY_NOTIFY_URL,
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '8080', 10),
  url: process.env.APP_URL || 'http://localhost:8080',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
}));
