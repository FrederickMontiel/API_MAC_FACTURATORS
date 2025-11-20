import { Injectable, Logger } from '@nestjs/common';
import { TransactionLogsService } from '../transaction-logs/transaction-logs.service';
import { CreateTransactionLogDto } from '../transaction-logs/dto/create-transaction-log.dto';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  constructor(private readonly transactionLogsService: TransactionLogsService) {}

  async logRequest(request: any, context: string): Promise<void> {
    const log: CreateTransactionLogDto = {
      tokenId: request.headers['authorization'] || null,
      transactionTypeId: null, // Define transaction type ID if applicable
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      },
      response: null,
      statusId: null, // Define status ID if applicable
      context: { context },
      headers: request.headers,
    };

    await this.transactionLogsService.create(log);
    this.logger.log(`Request logged: ${request.url}`);
  }

  async logError(error: any, context: string): Promise<void> {
    const log: CreateTransactionLogDto = {
      tokenId: null,
      transactionTypeId: null,
      request: null,
      response: null,
      statusId: null, // Define status ID for errors
      context: { context, error },
      headers: null,
    };

    await this.transactionLogsService.create(log);
    this.logger.error(`Error logged: ${error.message}`);
  }
}