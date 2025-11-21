import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Platform } from './platform.entity';
import { Permission } from './permission.entity';

@Entity('platform_permissions')
export class PlatformPermission {
  @PrimaryColumn({ name: 'platform_id' })
  platformId: string;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Platform, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
