import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Token } from './token.entity';
import { TransactionType } from './transaction-type.entity';
import { TransactionStatus } from './transaction-status.entity';

@Entity('transaction_logs')
export class TransactionLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'token_id' })
  tokenId: number;

  @ManyToOne(() => Token)
  @JoinColumn({ name: 'token_id' })
  token: Token;

  @Column({ type: 'integer', name: 'transaction_type_id' })
  transactionTypeId: number;

  @ManyToOne(() => TransactionType, { eager: true })
  @JoinColumn({ name: 'transaction_type_id' })
  transactionType: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'GTQ' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  context: any;

  @Column({ type: 'jsonb', nullable: true })
  headers: any;

  @Column({ type: 'jsonb' })
  request: any;

  @Column({ type: 'jsonb', nullable: true })
  response: any;

  @Column({ type: 'integer', name: 'status_id' })
  statusId: number;

  @ManyToOne(() => TransactionStatus, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent' })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
