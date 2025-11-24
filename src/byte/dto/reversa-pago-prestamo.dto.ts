import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReversaPagoPrestamoRequestDto {
  @ApiProperty({
    description: 'ID único de transacción para la reversa generado por MAC Génesis',
    example: 'TXN-2025-REV-001',
  })
  @IsString()
  @IsNotEmpty()
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de préstamo al que se aplicó el pago original',
    example: 'PRES-0001234567',
  })
  @IsString()
  @IsNotEmpty()
  numPrestamo: string;

  @ApiProperty({
    description: 'Número de autorización del pago original a reversar',
    example: 'AUTH12345678901234',
  })
  @IsString()
  @IsNotEmpty()
  autorizacionOriginal: string;

  @ApiProperty({
    description: 'Motivo de la reversa',
    example: 'Error en aplicación de pago',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

export class ReversaPagoPrestamoResponseDto {
  @ApiProperty({
    description: 'ID de transacción de la reversa',
    example: 'TXN-2025-REV-001',
  })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de autorización de la reversa',
    example: 'AUTH12345678901235',
  })
  autorizacion: string;

  @ApiProperty({
    description: 'Número de préstamo',
    example: 'PRES-0001234567',
  })
  numPrestamo: string;

  @ApiProperty({
    description: 'Número de cuenta (si se devolvió débito)',
    example: '1234567890',
    required: false,
  })
  numCuenta?: string;

  @ApiProperty({
    description: 'Nuevo saldo del préstamo después de la reversa',
    example: 26400.00,
  })
  nuevoSaldo: number;

  @ApiProperty({
    description: 'Monto reversado',
    example: 1000.00,
  })
  montoReversado: number;

  @ApiProperty({
    description: 'Código de respuesta (0 = éxito)',
    example: '0',
  })
  codRespuesta: string;

  @ApiProperty({
    description: 'Descripción de la respuesta',
    example: 'Reversa aplicada exitosamente',
  })
  descRespuesta: string;
}
