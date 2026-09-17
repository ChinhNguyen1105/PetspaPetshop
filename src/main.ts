
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Cho phép frontend gọi API và xử lý CORS preflight.
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Validate và transform dữ liệu đầu vào từ HTTP request.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

