import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Facturador API')
    .setDescription('API intermediaria para gestión de transacciones y servicios de facturación')
    .setVersion('1.0')
    .addTag('tokens', 'Gestión de tokens de acceso')
    .addTag('roles', 'Gestión de roles')
    .addTag('sections', 'Gestión de secciones')
    .addTag('permissions', 'Gestión de permisos')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Facturador API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Facturador API ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
