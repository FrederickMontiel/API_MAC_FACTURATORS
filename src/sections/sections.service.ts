import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const section = this.sectionRepository.create(createSectionDto);
    return await this.sectionRepository.save(section);
  }

  async findAll(): Promise<Section[]> {
    return await this.sectionRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Section | null> {
    return await this.sectionRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async update(id: number, updateSectionDto: UpdateSectionDto): Promise<Section | null> {
    await this.sectionRepository.update(id, updateSectionDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sectionRepository.delete(id);
  }
}
