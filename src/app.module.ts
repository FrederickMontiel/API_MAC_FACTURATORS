import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { SeccionesModule } from './secciones/secciones.module';
import { PermisosModule } from './permisos/permisos.module';
import { Token } from './entities/token.entity';
import { Role } from './entities/role.entity';
import { Seccion } from './entities/seccion.entity';
import { Permiso } from './entities/permiso.entity';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Token, Role, Seccion, Permiso],
        synchronize: configService.get('NODE_ENV') === 'development', // Solo en desarrollo
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    TokensModule,
    RolesModule,
    SeccionesModule,
    PermisosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
