import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { Section } from '../entities/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Section])],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
