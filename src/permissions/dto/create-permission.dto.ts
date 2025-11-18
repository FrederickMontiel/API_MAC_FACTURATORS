import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  sectionId: number;
}
