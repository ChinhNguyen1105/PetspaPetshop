import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';

// Modules
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // 1. Cấu hình biến môi trường toàn cục (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Kết nối Database (MySQL)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'petspa3',
      // Tự động quét và nạp toàn bộ các Entity trong dự án để tránh lỗi missing metadata giữa Role và Permission
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true, // BẮT BUỘC FALSE: Bảo vệ dữ liệu và cấu trúc bảng có sẵn trong DB
    }),

    // 3. Các module nghiệp vụ
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
