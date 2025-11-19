import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'View Invoices',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unique permission code',
    example: 'BILL_VIEW',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'View system invoices',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Section ID to which this permission belongs',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;
}
