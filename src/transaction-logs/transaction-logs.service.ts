import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionLog } from '../entities/transaction-log.entity';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';

@Injectable()
export class TransactionLogsService {
  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
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

  async findByType(transactionType: string, limit: number = 50): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: { transactionType },
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByStatus(status: string, limit: number = 50): Promise<TransactionLog[]> {
    return await this.transactionLogRepository.find({
      where: { status },
      relations: ['token'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
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
    const [total, success, failed, pending] = await Promise.all([
      this.transactionLogRepository.count(),
      this.transactionLogRepository.count({ where: { status: 'SUCCESS' } }),
      this.transactionLogRepository.count({ where: { status: 'FAILED' } }),
      this.transactionLogRepository.count({ where: { status: 'PENDING' } }),
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
