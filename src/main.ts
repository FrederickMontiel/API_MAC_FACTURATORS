import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Habilitar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS para permitir conexiones desde otros servicios
  app.enableCors({
    origin: '*', // Ajustar según tus necesidades de seguridad
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Facturador API ejecutándose en: http://localhost:${port}`);
}
bootstrap();
