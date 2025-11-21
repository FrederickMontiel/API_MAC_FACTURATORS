import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTokenDto {
  @ApiProperty({
    description: 'Token ID',
    example: 123456,
    required: false,
  })
  id?: number;

  @ApiProperty({
    description: 'Platform ID reference',
    example: 'sitio-web-operaciones',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  platformId: string;

  @ApiProperty({
    description: 'Platform token number (sequential per platform)',
    example: 1,
    required: false,
  })
  platformTokenNumber?: number;

  @ApiProperty({
    description: 'Token active status',
    example: true,
    default: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  jwt: string;
}
