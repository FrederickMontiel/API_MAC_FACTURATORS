import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  seccionId: number;
}
