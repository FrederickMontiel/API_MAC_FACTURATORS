import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
