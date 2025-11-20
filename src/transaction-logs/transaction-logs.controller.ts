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

  @Get('statuses')
  @ApiOperation({ summary: 'Get all transaction statuses' })
  @ApiResponse({ status: 200, description: 'List of transaction statuses' })
  getAllStatuses() {
    return this.transactionLogsService.getAllStatuses();
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all transaction types' })
  @ApiResponse({ status: 200, description: 'List of transaction types' })
  getAllTypes() {
    return this.transactionLogsService.getAllTypes();
  }

  @Get('type/:typeId')
  @ApiOperation({ summary: 'Get logs by transaction type ID' })
  @ApiParam({ name: 'typeId', description: 'Transaction type ID', example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Logs for the transaction type' })
  findByType(@Param('typeId') typeId: string, @Query('limit') limit?: number) {
    return this.transactionLogsService.findByType(+typeId, limit);
  }

  @Get('status/:statusId')
  @ApiOperation({ summary: 'Get logs by status ID' })
  @ApiParam({ name: 'statusId', description: 'Status ID', example: 3 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Logs for the status' })
  findByStatus(@Param('statusId') statusId: string, @Query('limit') limit?: number) {
    return this.transactionLogsService.findByStatus(+statusId, limit);
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
