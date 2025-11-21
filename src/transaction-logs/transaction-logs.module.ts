import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionLogsService } from './transaction-logs.service';
import { TransactionLog } from '../entities/transaction-log.entity';
import { TransactionStatus } from '../entities/transaction-status.entity';
import { TransactionType } from '../entities/transaction-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLog, TransactionStatus, TransactionType])],
  providers: [TransactionLogsService],
  exports: [TransactionLogsService],
})
export class TransactionLogsModule {}
