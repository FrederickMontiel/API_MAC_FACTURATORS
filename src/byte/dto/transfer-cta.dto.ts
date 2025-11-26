import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, Max, Length, Matches } from 'class-validator';

export class TransferCtaRequestDto {
  @ApiProperty({
    description: 'ID de transacción único generado por MAC Génesis',
    example: 'TXN-2025-001237',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de transacción es obligatorio' })
  @Length(5, 100, { message: 'El ID de transacción debe tener entre 5 y 100 caracteres' })
  idTransaccion: string;

  @ApiProperty({
    description: 'Número de cuenta origen (desde donde se debita)',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de cuenta origen es obligatorio' })
  @Length(8, 20, { message: 'El número de cuenta origen debe tener entre 8 y 20 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El número de cuenta origen solo debe contener dígitos' })
  numCuentaOrigen: string;

  @ApiProperty({
    description: 'Número de cuenta destino (donde se acredita)',
    example: '0987654321',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de cuenta destino es obligatorio' })
  @Length(8, 20, { message: 'El número de cuenta destino debe tener entre 8 y 20 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El número de cuenta destino solo debe contener dígitos' })
  numCuentaDestino: string;

  @ApiProperty({
    description: 'Monto de la transferencia',
    example: 1000.00,
  })
  @IsNumber({}, { message: 'El monto de transferencia debe ser un número válido' })
  @Min(0.01, { message: 'El monto de transferencia debe ser mayor a Q0.01' })
  @Max(100000.00, { message: 'El monto de transferencia no puede exceder Q100,000.00 por transacción' })
  @IsNotEmpty({ message: 'El monto de transferencia es obligatorio' })
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
