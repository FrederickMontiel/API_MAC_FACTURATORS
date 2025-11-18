import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from '../entities/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    const permiso = this.permisoRepository.create(createPermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  async findAll(): Promise<Permiso[]> {
    return await this.permisoRepository.find({
      relations: ['seccion', 'roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Permiso | null> {
    return await this.permisoRepository.findOne({
      where: { id },
      relations: ['seccion', 'roles'],
    });
  }

  async findBySeccion(seccionId: number): Promise<Permiso[]> {
    return await this.permisoRepository.find({
      where: { seccionId },
      relations: ['seccion'],
    });
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto): Promise<Permiso | null> {
    await this.permisoRepository.update(id, updatePermisoDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permisoRepository.delete(id);
  }
}
