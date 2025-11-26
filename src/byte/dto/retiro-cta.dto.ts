import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max, Length, Matches } from 'class-validator';

export class RetiroCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001235',
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
    description: 'Monto del retiro',
    example: 500.00,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  montoRetiro: number;
}

export class RetiroCtaResponseDto {
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
