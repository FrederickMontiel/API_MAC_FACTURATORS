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
    description: 'Type of transaction',
    example: 'BYTE_TRANSFER',
  })
  @IsString()
  @IsNotEmpty()
  transactionType: string;

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
    description: 'Transaction status',
    example: 'SUCCESS',
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'ERROR'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

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
