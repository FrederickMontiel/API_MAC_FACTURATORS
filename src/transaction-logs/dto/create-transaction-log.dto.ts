import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionLogDto {
  @ApiProperty({
    description: 'Token ID that made the transaction',
    example: 123456,
  })
  @IsNumber()
  @IsNotEmpty()
  tokenId: number;

  @ApiProperty({
    description: 'Transaction type ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  transactionTypeId: number;

  @ApiPropertyOptional({
    description: 'Transaction amount',
    example: 1500.50,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'GTQ',
    default: 'GTQ',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Additional context data',
    example: { customerName: 'John Doe', accountNumber: '123456' },
  })
  @IsObject()
  @IsOptional()
  context?: any;

  @ApiPropertyOptional({
    description: 'HTTP headers from the request',
    example: { 'content-type': 'application/json', 'authorization': 'Bearer token' },
  })
  @IsObject()
  @IsOptional()
  headers?: any;

  @ApiProperty({
    description: 'Request payload',
    example: { method: 'POST', endpoint: '/api/transfer', body: {} },
  })
  @IsObject()
  @IsNotEmpty()
  request: any;

  @ApiPropertyOptional({
    description: 'Response payload',
    example: { statusCode: 200, data: {} },
  })
  @IsObject()
  @IsOptional()
  response?: any;

  @ApiProperty({
    description: 'Transaction status ID',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  statusId: number;

  @ApiPropertyOptional({
    description: 'Error message if transaction failed',
    example: 'Insufficient funds',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Client IP address',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Client user agent',
    example: 'Mozilla/5.0...',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
