import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permisos'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id },
      relations: ['permisos', 'permisos.seccion'],
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.roleRepository.update(id, updateRoleDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
