import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransactionLogsService } from './transaction-logs.service';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';

@ApiTags('transaction-logs')
@Controller('transaction-logs')
export class TransactionLogsController {
  constructor(private readonly transactionLogsService: TransactionLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction log' })
  @ApiResponse({ status: 201, description: 'Log created successfully' })
  create(@Body() createTransactionLogDto: CreateTransactionLogDto) {
    return this.transactionLogsService.create(createTransactionLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transaction logs' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiResponse({ status: 200, description: 'List of transaction logs' })
  findAll(@Query('limit') limit?: number) {
    return this.transactionLogsService.findAll(limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics' })
  getStatistics() {
    return this.transactionLogsService.getStatistics();
  }

  @Get('token/:tokenId')
  @ApiOperation({ summary: 'Get logs by token ID' })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: 123456 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Logs for the token' })
  findByToken(@Param('tokenId') tokenId: string, @Query('limit') limit?: number) {
    return this.transactionLogsService.findByToken(+tokenId, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get logs by transaction type' })
  @ApiParam({ name: 'type', description: 'Transaction type', example: 'BYTE_TRANSFER' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Logs for the transaction type' })
  findByType(@Param('type') type: string, @Query('limit') limit?: number) {
    return this.transactionLogsService.findByType(type, limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get logs by status' })
  @ApiParam({ name: 'status', description: 'Status', example: 'SUCCESS' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Logs for the status' })
  findByStatus(@Param('status') status: string, @Query('limit') limit?: number) {
    return this.transactionLogsService.findByStatus(status, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction log by ID' })
  @ApiParam({ name: 'id', description: 'Log ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Log found' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  findOne(@Param('id') id: string) {
    return this.transactionLogsService.findOne(+id);
  }
}
