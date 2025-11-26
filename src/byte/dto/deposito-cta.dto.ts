import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max, Length, Matches, ValidateIf, IsOptional } from 'class-validator';

export class DepositoCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001234',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de transacción es obligatorio' })
  @Length(5, 100, { message: 'El ID de transacción debe tener entre 5 y 100 caracteres' })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de cuenta',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de cuenta es obligatorio' })
  @Length(8, 20, { message: 'El número de cuenta debe tener entre 8 y 20 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El número de cuenta solo debe contener dígitos' })
  numCuenta: string;

  @ApiProperty({
    description: 'Monto en efectivo',
    example: 500.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto en efectivo debe ser un número válido' })
  @Min(0, { message: 'El monto en efectivo no puede ser negativo' })
  @Max(999999.99, { message: 'El monto en efectivo no puede exceder Q999,999.99' })
  montoEfectivo?: number;

  @ApiProperty({
    description: 'Monto en cheque',
    example: 1000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto en cheque debe ser un número válido' })
  @Min(0, { message: 'El monto en cheque no puede ser negativo' })
  @Max(999999.99, { message: 'El monto en cheque no puede exceder Q999,999.99' })
  montoCheque?: number;

  @ApiProperty({
    description: 'Monto total del depósito',
    example: 1500.00,
  })
  @IsNumber({}, { message: 'El monto total debe ser un número válido' })
  @Min(0.01, { message: 'El monto total debe ser mayor a Q0.01' })
  @Max(999999.99, { message: 'El monto total no puede exceder Q999,999.99' })
  @IsNotEmpty({ message: 'El monto total es obligatorio' })
  montoTotal: number;
}

export class DepositoCtaResponseDto {
  @ApiProperty({ description: 'ID de transacción' })
  idTransaccion: string;

  @ApiProperty({ description: 'Número de autorización generado por el Core' })
  autorizacion: string;

  @ApiProperty({ description: 'Código de respuesta (0 = éxito, >0 = error)' })
  codRespuesta: string;

  @ApiProperty({ description: 'Descripción de la respuesta' })
  descRespuesta: string;

  @ApiProperty({ description: 'Número de cuenta' })
  numCuenta: string;

  @ApiProperty({ description: 'Nuevo saldo de la cuenta' })
  nuevoSaldo: number;
}
