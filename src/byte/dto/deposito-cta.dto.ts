import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class DepositoCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001234',
  })
  @IsString()
  @IsNotEmpty()
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de cuenta',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  numCuenta: string;

  @ApiProperty({
    description: 'Monto en efectivo',
    example: 500.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  montoEfectivo?: number;

  @ApiProperty({
    description: 'Monto en cheque',
    example: 1000.00,
    required: false,
  })
  @IsNumber()
  @Min(0)
  montoCheque?: number;

  @ApiProperty({
    description: 'Monto total del depósito',
    example: 1500.00,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
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
