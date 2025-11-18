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
import { Seccion } from './seccion.entity';
import { Role } from './role.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Seccion, (seccion) => seccion.permisos)
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ name: 'seccion_id' })
  seccionId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permisos)
  @JoinTable({
    name: 'role_permisos',
    joinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
