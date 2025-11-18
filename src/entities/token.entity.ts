import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  platform: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 500 })
  jwt: string;
}
