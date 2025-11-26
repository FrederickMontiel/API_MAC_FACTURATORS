import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional, Length, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PagoPrestamoRequestDto {
  @ApiProperty({
    description: 'ID único de transacción generado por MAC Génesis',
    example: 'TXN-2025-PAGO-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de transacción es obligatorio' })
  @Length(5, 100, { message: 'El ID de transacción debe tener entre 5 y 100 caracteres' })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de préstamo al que se aplicará el pago',
    example: 'PRES-0001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de préstamo es obligatorio' })
  @Length(5, 30, { message: 'El número de préstamo debe tener entre 5 y 30 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'El número de préstamo solo debe contener letras mayúsculas, números y guiones' })
  numPrestamo: string;

  @ApiProperty({
    description: 'Número de cuenta desde donde se debita (opcional si se paga en efectivo/cheque)',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
  @Length(8, 20, { message: 'El número de cuenta debe tener entre 8 y 20 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El número de cuenta solo debe contener dígitos' })
  @ValidateIf((o) => o.montoDebito && o.montoDebito > 0, { message: 'El número de cuenta es obligatorio cuando hay monto a debitar' })
  numCuenta?: string;

  @ApiProperty({
    description: 'Monto a debitar de la cuenta',
    example: 500.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto de débito debe ser un número válido' })
  @Min(0, { message: 'El monto de débito no puede ser negativo' })
  @Max(100000.00, { message: 'El monto de débito no puede exceder Q100,000.00' })
  montoDebito?: number;

  @ApiProperty({
    description: 'Monto pagado en efectivo',
    example: 300.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto en efectivo debe ser un número válido' })
  @Min(0, { message: 'El monto en efectivo no puede ser negativo' })
  @Max(50000.00, { message: 'El monto en efectivo no puede exceder Q50,000.00' })
  montoEfectivo?: number;

  @ApiProperty({
    description: 'Monto pagado con cheque',
    example: 200.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto en cheque debe ser un número válido' })
  @Min(0, { message: 'El monto en cheque no puede ser negativo' })
  @Max(500000.00, { message: 'El monto en cheque no puede exceder Q500,000.00' })
  montoCheque?: number;

  @ApiProperty({
    description: 'Monto total del pago (debe ser suma de débito + efectivo + cheque)',
    example: 1000.0,
  })
  @IsNumber({}, { message: 'El monto total debe ser un número válido' })
  @Min(0.01, { message: 'El monto total debe ser mayor a Q0.01' })
  @Max(500000.00, { message: 'El monto total no puede exceder Q500,000.00' })
  @IsNotEmpty({ message: 'El monto total es obligatorio' })
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
