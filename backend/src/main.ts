import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Cho phép Frontend chạy trên localhost và IP LAN.
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.1.195:5173',
    ],
    credentials: true,
  });

  // Validate và transform dữ liệu đầu vào từ HTTP request.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cho phép các thiết bị khác trong mạng LAN truy cập Backend.
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Backend running at http://localhost:${port}`);
  console.log(`LAN API: http://192.168.1.195:${port}`);
}

void bootstrap();
