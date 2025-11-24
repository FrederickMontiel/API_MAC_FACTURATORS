import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TransferCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001237',
  })
  @IsString()
  @IsNotEmpty()
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de cuenta origen (desde donde se debita)',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  numCuentaOrigen: string;

  @ApiProperty({
    description: 'Número de cuenta destino (donde se acredita)',
    example: '0987654321',
  })
  @IsString()
  @IsNotEmpty()
  numCuentaDestino: string;

  @ApiProperty({
    description: 'Monto de la transferencia',
    example: 1000.00,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  montoTransferencia: number;
}

export class TransferCtaResponseDto {
  @ApiProperty({ description: 'ID de transacción' })
  idTransaccion: string;

  @ApiProperty({ description: 'Número de autorización generado por el Core' })
  autorizacion: string;

  @ApiProperty({ description: 'Código de respuesta (0 = éxito, >0 = error)' })
  codRespuesta: string;

  @ApiProperty({ description: 'Descripción de la respuesta' })
  descRespuesta: string;
}
