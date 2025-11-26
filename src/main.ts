import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Habilitar validación global de DTOs con mensajes de error personalizados
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return {
          statusCode: 400,
          message: 'Errores de validación',
          errors: messages,
        };
      },
    }),
  );

  // Habilitar filtros globales de excepciones
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Facturador API')
    .setDescription('API para intermediario de facturación con sistema de permisos por plataforma')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Facturador API ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`📦 Sistema de generación de tokens mediante CLI`);
}
bootstrap();
