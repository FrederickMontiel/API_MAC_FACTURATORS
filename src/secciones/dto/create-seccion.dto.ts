import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSeccionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
