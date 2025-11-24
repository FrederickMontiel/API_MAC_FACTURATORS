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
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
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
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
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
    status: 503,
    description: 'Servicio Byte no disponible',
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
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
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
    status: 503,
    description: 'Servicio Byte no disponible',
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
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
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
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio Byte no disponible',
  })
  async reversaPagoPrestamo(@Body() request: ReversaPagoPrestamoRequestDto): Promise<ReversaPagoPrestamoResponseDto> {
    return this.byteService.reversaPagoPrestamo(request);
  }
}
