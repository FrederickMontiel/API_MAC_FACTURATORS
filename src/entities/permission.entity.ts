import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Section, (section) => section.permissions)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ name: 'section_id' })
  sectionId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
