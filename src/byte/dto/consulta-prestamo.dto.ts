import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaPrestamoRequestDto {
  @ApiProperty({
    description: 'ID único de transacción generado por MAC Génesis',
    example: 'TXN-2025-PRE-001',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de transacción es obligatorio' })
  @Length(5, 100, { message: 'El ID de transacción debe tener entre 5 y 100 caracteres' })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de préstamo a consultar',
    example: 'PRES-0001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de préstamo es obligatorio' })
  @Length(5, 30, { message: 'El número de préstamo debe tener entre 5 y 30 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'El número de préstamo solo debe contener letras mayúsculas, números y guiones' })
  numPrestamo: string;
}

export class ConsultaPrestamoResponseDto {
  @ApiProperty({
    description: 'ID de transacción',
    example: 'TXN-2025-PRE-001',
  })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de autorización',
    example: 'AUTH12345678901234',
  })
  autorizacion: string;

  @ApiProperty({
    description: 'Número de préstamo consultado',
    example: 'PRES-0001234567',
  })
  numPrestamo: string;

  @ApiProperty({
    description: 'Saldo pendiente del capital',
    example: 25000.0,
  })
  saldoCapital: number;

  @ApiProperty({
    description: 'Saldo pendiente de intereses',
    example: 1250.0,
  })
  saldoInteres: number;

  @ApiProperty({
    description: 'Saldo de mora acumulado',
    example: 150.0,
  })
  saldoMora: number;

  @ApiProperty({
    description: 'Saldo total pendiente (capital + interés + mora)',
    example: 26400.0,
  })
  saldoTotal: number;

  @ApiProperty({
    description: 'Monto del próximo pago',
    example: 1500.0,
  })
  proximoPago: number;

  @ApiProperty({
    description: 'Fecha del próximo pago en formato DD/MM/YYYY',
    example: '15/12/2025',
  })
  fechaProximoPago: string;

  @ApiProperty({
    description: 'Código de respuesta (0 = éxito)',
    example: '0',
  })
  codRespuesta: string;

  @ApiProperty({
    description: 'Descripción de la respuesta',
    example: 'Consulta exitosa',
  })
  descRespuesta: string;
}
