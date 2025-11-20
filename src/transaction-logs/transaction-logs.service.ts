import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionLog } from '../entities/transaction-log.entity';
import { TransactionStatus } from '../entities/transaction-status.entity';
import { TransactionType } from '../entities/transaction-type.entity';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';

@Injectable()
export class TransactionLogsService {
  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
    @InjectRepository(TransactionStatus)
    private readonly transactionStatusRepository: Repository<TransactionStatus>,
    @InjectRepository(TransactionType)
    private readonly transactionTypeRepository: Repository<TransactionType>,
  ) {}

  async create(createTransactionLogDto: CreateTransactionLogDto): Promise<TransactionLog> {
    const log = this.transactionLogRepository.create(createTransactionLogDto);
    return await this.transactionLogRepository.save(log);
  }

  async findAll(limit: number = 100): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<TransactionLog | null> {
    return await this.transactionLogRepository.findOne({
      where: { id },
      relations: ['token'],
    });
  }

  async findByToken(tokenId: number, limit: number = 50): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: { tokenId },
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByType(transactionTypeId: number, limit: number = 50): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: { transactionTypeId },
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByStatus(statusId: number, limit: number = 50): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: { statusId },
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAllStatuses(): Promise<TransactionStatus[]> {
    return await this.transactionStatusRepository.find({
      order: { id: 'ASC' },
    });
  }

  async getAllTypes(): Promise<TransactionType[]> {
    return await this.transactionTypeRepository.find({
      order: { id: 'ASC' },
    });
  }

  async getStatusByCode(code: string): Promise<TransactionStatus | null> {
    return await this.transactionStatusRepository.findOne({ where: { code } });
  }

  async getTypeByCode(code: string): Promise<TransactionType | null> {
    return await this.transactionTypeRepository.findOne({ where: { code } });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['token'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics() {
    const successStatus = await this.getStatusByCode('SUCCESS');
    const failedStatus = await this.getStatusByCode('FAILED');
    const pendingStatus = await this.getStatusByCode('PENDING');

    const [total, success, failed, pending] = await Promise.all([
      this.transactionLogRepository.count(),
      successStatus ? this.transactionLogRepository.count({ where: { statusId: successStatus.id } }) : 0,
      failedStatus ? this.transactionLogRepository.count({ where: { statusId: failedStatus.id } }) : 0,
      pendingStatus ? this.transactionLogRepository.count({ where: { statusId: pendingStatus.id } }) : 0,
    ]);

    return {
      total,
      success,
      failed,
      pending,
      successRate: total > 0 ? ((success / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}
