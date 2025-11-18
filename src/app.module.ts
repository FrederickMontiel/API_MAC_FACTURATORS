import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokensModule } from './tokens/tokens.module';
import { RolesModule } from './roles/roles.module';
import { SectionsModule } from './sections/sections.module';
import { PermissionsModule } from './permissions/permissions.module';
import { Token } from './entities/token.entity';
import { Role } from './entities/role.entity';
import { Section } from './entities/section.entity';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [
    // Environment variables configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM configuration with PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Token, Role, Section, Permission],
        synchronize: configService.get('NODE_ENV') === 'development', // Only in development
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Application modules
    TokensModule,
    RolesModule,
    SectionsModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
