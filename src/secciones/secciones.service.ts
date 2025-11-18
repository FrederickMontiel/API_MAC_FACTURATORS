import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seccion } from '../entities/seccion.entity';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';

@Injectable()
export class SeccionesService {
  constructor(
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
  ) {}

  async create(createSeccionDto: CreateSeccionDto): Promise<Seccion> {
    const seccion = this.seccionRepository.create(createSeccionDto);
    return await this.seccionRepository.save(seccion);
  }

  async findAll(): Promise<Seccion[]> {
    return await this.seccionRepository.find({
      relations: ['permisos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Seccion | null> {
    return await this.seccionRepository.findOne({
      where: { id },
      relations: ['permisos'],
    });
  }

  async update(id: number, updateSeccionDto: UpdateSeccionDto): Promise<Seccion | null> {
    await this.seccionRepository.update(id, updateSeccionDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.seccionRepository.delete(id);
  }
}
