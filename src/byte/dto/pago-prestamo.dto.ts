import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PagoPrestamoRequestDto {
  @ApiProperty({
    description: 'ID único de transacción generado por MAC Génesis',
    example: 'TXN-2025-PAGO-001',
  })
  @IsString()
  @IsNotEmpty()
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de préstamo al que se aplicará el pago',
    example: 'PRES-0001234567',
  })
  @IsString()
  @IsNotEmpty()
  numPrestamo: string;

  @ApiProperty({
    description: 'Número de cuenta desde donde se debita (opcional si se paga en efectivo/cheque)',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  numCuenta?: string;

  @ApiProperty({
    description: 'Monto a debitar de la cuenta',
    example: 500.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoDebito?: number;

  @ApiProperty({
    description: 'Monto pagado en efectivo',
    example: 300.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoEfectivo?: number;

  @ApiProperty({
    description: 'Monto pagado con cheque',
    example: 200.0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoCheque?: number;

  @ApiProperty({
    description: 'Monto total del pago (debe ser suma de débito + efectivo + cheque)',
    example: 1000.0,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  montoTotal: number;
}

export class PagoPrestamoResponseDto {
  @ApiProperty({
    description: 'ID de transacción',
    example: 'TXN-2025-PAGO-001',
  })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de autorización',
    example: 'AUTH12345678901234',
  })
  autorizacion: string;

  @ApiProperty({
    description: 'Número de préstamo pagado',
    example: 'PRES-0001234567',
  })
  numPrestamo: string;

  @ApiProperty({
    description: 'Nuevo saldo pendiente del préstamo después del pago',
    example: 25400.0,
  })
  nuevoSaldo: number;

  @ApiProperty({
    description: 'Código de respuesta (0 = éxito)',
    example: '0',
  })
  codRespuesta: string;

  @ApiProperty({
    description: 'Descripción de la respuesta',
    example: 'Pago aplicado exitosamente',
  })
  descRespuesta: string;
}
