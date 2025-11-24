import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConsultaCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001236',
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
}

export class ConsultaCtaResponseDto {
  @ApiProperty({ description: 'ID de transacción' })
  idTransaccion: string;

  @ApiProperty({ description: 'Número de autorización generado por el Core' })
  autorizacion: string;

  @ApiProperty({ description: 'Estado de la cuenta' })
  estadoCuenta: string;

  @ApiProperty({ description: 'Fecha de último movimiento' })
  fechaUltMov: string;

  @ApiProperty({ description: 'Saldo total (disponible + reservas - bloqueos)' })
  saldoTotal: number;

  @ApiProperty({ description: 'Saldo disponible (saldo total - reservas - bloqueos)' })
  saldoDisponible: number;

  @ApiProperty({ description: 'Saldo de reservas' })
  saldoReservas: number;

  @ApiProperty({ description: 'Saldo de bloqueos' })
  saldoBloqueos: number;

  @ApiProperty({ description: 'Código de respuesta (0 = éxito, >0 = error)' })
  codRespuesta: string;

  @ApiProperty({ description: 'Descripción de la respuesta' })
  descRespuesta: string;
}
