import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: ['section', 'roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { id },
      relations: ['section', 'roles'],
    });
  }

  async findBySection(sectionId: number): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { sectionId },
      relations: ['section'],
    });
  }

  async findByCode(code: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { code },
      relations: ['section'],
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
    await this.permissionRepository.update(id, updatePermissionDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
