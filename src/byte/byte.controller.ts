import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ByteService } from './byte.service';
import { 
  DepositoCtaRequestDto, 
  DepositoCtaResponseDto, 
  RetiroCtaRequestDto, 
  RetiroCtaResponseDto,
  ConsultaCtaRequestDto,
  ConsultaCtaResponseDto,
  TransferCtaRequestDto,
  TransferCtaResponseDto,
  ConsultaPrestamoRequestDto,
  ConsultaPrestamoResponseDto,
  PagoPrestamoRequestDto,
  PagoPrestamoResponseDto,
  ReversaPagoPrestamoRequestDto,
  ReversaPagoPrestamoResponseDto
} from './dto';

@ApiTags('Byte')
@ApiBearerAuth('JWT-auth')
@Controller('byte')
export class ByteController {
  constructor(private readonly byteService: ByteService) {}

  @Post('deposito-cta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Depósito a Cuenta con Efectivo o Cheque',
    description: 'Realiza un depósito a una cuenta de ahorro, ya sea en efectivo o cheque. Componente #002 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Depósito realizado exitosamente',
    type: DepositoCtaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o monto total no coincide con suma de métodos de pago',
    schema: {
      example: {
        statusCode: 400,
        message: 'El monto total no coincide con la suma de efectivo y cheque',
        byteCode: 'BYTE_AMOUNT',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cuenta 1234567890 no existe en el sistema',
        byteCode: 'BYTE_001',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
    schema: {
      example: {
        statusCode: 503,
        message: 'Servicio Byte no disponible temporalmente',
        byteCode: 'BYTE_503',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
    schema: {
      example: {
        statusCode: 504,
        message: 'Tiempo de espera agotado al comunicarse con Byte',
        byteCode: 'BYTE_TIMEOUT',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  async depositoCta(@Body() request: DepositoCtaRequestDto): Promise<DepositoCtaResponseDto> {
    return this.byteService.depositoCta(request);
  }

  @Post('retiro-cta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retiro de Efectivo de Cuenta de Ahorro',
    description: 'Realiza un retiro de efectivo de una cuenta de ahorro. Componente #003 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retiro realizado exitosamente',
    type: RetiroCtaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o saldo insuficiente',
    schema: {
      example: {
        statusCode: 400,
        message: 'Saldo insuficiente en cuenta 1234567890. Disponible: Q5000.00, Requerido: Q10000.00',
        byteCode: 'BYTE_003',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async retiroCta(@Body() request: RetiroCtaRequestDto): Promise<RetiroCtaResponseDto> {
    return this.byteService.retiroCta(request);
  }

  @Post('consulta-cta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulta de Saldos de Cuenta',
    description: 'Consulta el estado, saldos y movimientos de una cuenta de ahorro o plazo fijo. Componente #004 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada exitosamente',
    type: ConsultaCtaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async consultaCta(@Body() request: ConsultaCtaRequestDto): Promise<ConsultaCtaResponseDto> {
    return this.byteService.consultaCta(request);
  }

  @Post('transfer-cta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transferencia entre Cuentas (Propias y Terceros)',
    description: 'Realiza una transferencia de fondos entre cuentas dentro de la misma institución. Componente #005 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transferencia realizada exitosamente',
    type: TransferCtaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos, saldo insuficiente o cuentas iguales',
    schema: {
      example: {
        statusCode: 400,
        message: 'Las cuentas origen y destino no pueden ser la misma',
        byteCode: 'BYTE_002',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta origen o destino no encontrada',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async transferCta(@Body() request: TransferCtaRequestDto): Promise<TransferCtaResponseDto> {
    return this.byteService.transferCta(request);
  }

  @Post('consulta-prestamo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulta de Saldo de Préstamo',
    description: 'Consulta los saldos pendientes de un préstamo: capital, intereses, mora y próximo pago. Componente #006 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada exitosamente',
    type: ConsultaPrestamoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Préstamo no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Préstamo PRES-0001234567 no existe en el sistema',
        byteCode: 'BYTE_001',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async consultaPrestamo(@Body() request: ConsultaPrestamoRequestDto): Promise<ConsultaPrestamoResponseDto> {
    return this.byteService.consultaPrestamo(request);
  }

  @Post('pago-prestamo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pago de Préstamo con Múltiples Métodos',
    description: 'Aplica un pago a un préstamo usando débito de cuenta, efectivo y/o cheque. Componente #007 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago aplicado exitosamente',
    type: PagoPrestamoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, monto total no coincide, saldo insuficiente o cuenta requerida',
    schema: {
      examples: {
        montoInvalido: {
          value: {
            statusCode: 400,
            message: 'El monto total no coincide con la suma de débito, efectivo y cheque',
            byteCode: 'BYTE_AMOUNT',
            timestamp: '2025-11-26T10:00:00.000Z',
          },
        },
        cuentaRequerida: {
          value: {
            statusCode: 400,
            message: 'Número de cuenta requerido cuando se especifica monto a debitar',
            byteCode: 'BYTE_002',
            timestamp: '2025-11-26T10:00:00.000Z',
          },
        },
        saldoInsuficiente: {
          value: {
            statusCode: 400,
            message: 'Saldo insuficiente en cuenta 1234567890. Disponible: Q500.00, Requerido: Q1000.00',
            byteCode: 'BYTE_003',
            timestamp: '2025-11-26T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Préstamo o cuenta no encontrada',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async pagoPrestamo(@Body() request: PagoPrestamoRequestDto): Promise<PagoPrestamoResponseDto> {
    return this.byteService.pagoPrestamo(request);
  }

  @Post('reversa-pago-prestamo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reversa de Pago de Préstamo',
    description: 'Reversa un pago previamente aplicado a un préstamo, restaurando el saldo y devolviendo el débito si aplica. Componente #008 de Byte.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reversa aplicada exitosamente',
    type: ReversaPagoPrestamoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o transacción no permitida',
    schema: {
      examples: {
        yaReversada: {
          value: {
            statusCode: 404,
            message: 'Autorización AUTH12345 no encontrada o ya fue reversada',
            byteCode: 'BYTE_AUTH_NOT_FOUND',
            timestamp: '2025-11-26T10:00:00.000Z',
          },
        },
        autorizacionInvalida: {
          value: {
            statusCode: 400,
            message: 'La autorización no corresponde a este préstamo',
            byteCode: 'BYTE_002',
            timestamp: '2025-11-26T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Préstamo o autorización no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Transacción duplicada',
    schema: {
      example: {
        statusCode: 409,
        message: 'La transacción TXN-2025-REV-001 ya fue procesada anteriormente',
        byteCode: 'BYTE_DUPLICATE',
        timestamp: '2025-11-26T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  @ApiResponse({
    status: 504,
    description: 'Timeout en comunicación con Byte',
  })
  async reversaPagoPrestamo(@Body() request: ReversaPagoPrestamoRequestDto): Promise<ReversaPagoPrestamoResponseDto> {
    return this.byteService.reversaPagoPrestamo(request);
  }
}
