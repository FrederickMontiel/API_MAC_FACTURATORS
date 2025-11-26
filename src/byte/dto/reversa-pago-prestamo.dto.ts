import { IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReversaPagoPrestamoRequestDto {
  @ApiProperty({
    description: 'ID único de transacción para la reversa generado por MAC Génesis',
    example: 'TXN-2025-REV-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de transacción es obligatorio' })
  @Length(5, 100, { message: 'El ID de transacción debe tener entre 5 y 100 caracteres' })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de préstamo al que se aplicó el pago original',
    example: 'PRES-0001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de préstamo es obligatorio' })
  @Length(5, 30, { message: 'El número de préstamo debe tener entre 5 y 30 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'El número de préstamo solo debe contener letras mayúsculas, números y guiones' })
  numPrestamo: string;

  @ApiProperty({
    description: 'Número de autorización del pago original a reversar',
    example: 'AUTH12345678901234',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de autorización es obligatorio' })
  @Length(10, 50, { message: 'El número de autorización debe tener entre 10 y 50 caracteres' })
  @Matches(/^[A-Z0-9]+$/, { message: 'El número de autorización solo debe contener letras mayúsculas y números' })
  autorizacionOriginal: string;

  @ApiProperty({
    description: 'Motivo de la reversa',
    example: 'Error en aplicación de pago',
    required: false,
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo de la reversa es obligatorio' })
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @Length(10, 500, { message: 'El motivo debe tener entre 10 y 500 caracteres' })
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
