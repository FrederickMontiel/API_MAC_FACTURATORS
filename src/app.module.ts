import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokensModule } from './tokens/tokens.module';
import { SectionsModule } from './sections/sections.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TransactionLogsModule } from './transaction-logs/transaction-logs.module';
import { Token } from './entities/token.entity';
import { Section } from './entities/section.entity';
import { Permission } from './entities/permission.entity';
import { TransactionLog } from './entities/transaction-log.entity';
import { TransactionStatus } from './entities/transaction-status.entity';
import { TransactionType } from './entities/transaction-type.entity';
import { Platform } from './entities/platform.entity';
import { PlatformPermission } from './entities/platform-permission.entity';

@Module({
  imports: [
    // Environment variables configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
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
        entities: [Token, Section, Permission, TransactionLog, TransactionStatus, TransactionType, Platform, PlatformPermission],
        synchronize: false, // Database schema managed by SQL script
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // Application modules
    TokensModule,
    SectionsModule,
    PermissionsModule,
    TransactionLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
