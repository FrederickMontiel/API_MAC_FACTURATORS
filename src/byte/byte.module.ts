import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ByteService } from './byte.service';
import { ByteMockService } from './byte-mock.service';
import { ByteController } from './byte.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ByteController],
  providers: [ByteService, ByteMockService],
  exports: [ByteService, ByteMockService],
})
export class ByteModule {}
