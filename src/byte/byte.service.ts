import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
import { ByteMockService } from './byte-mock.service';

@Injectable()
export class ByteService {
  private readonly logger = new Logger(ByteService.name);
  private readonly urlByte: string;
  private readonly useMock: boolean;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private byteMockService: ByteMockService,
  ) {
    this.urlByte = this.configService.get<string>('URL_BYTE') || '';
    this.useMock = !this.urlByte || this.urlByte.includes('localhost');

    if (this.useMock) {
      this.logger.warn('⚠️  Servicio Byte en modo MOCK - No se realizarán llamadas reales');
    } else {
      this.logger.log(`✓ Servicio Byte configurado: ${this.urlByte}`);
    }
  }

  /**
   * Depósito a Cuenta con Efectivo o Cheque
   * Componente #002 según documentación
   */
  async depositoCta(request: DepositoCtaRequestDto): Promise<DepositoCtaResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.depositoCta(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(`Enviando depósito a Byte - Cuenta: ${request.numCuenta}, Monto: ${request.montoTotal}`);

      const payload = {
        depositoCta_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numCuenta: request.numCuenta,
            montoEfectivo: request.montoEfectivo?.toString() || '',
            montoCheque: request.montoCheque?.toString() || '',
            montoTotal: request.montoTotal.toString(),
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/depositoCta`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos timeout
        })
      );

      const byteResponse = response.data.depositoCta_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
        numCuenta: byteResponse.detalle.numCuenta || request.numCuenta,
        nuevoSaldo: parseFloat(byteResponse.detalle.nuevoSaldo || '0'),
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Retiro de Efectivo de Cuenta de Ahorro
   * Componente #003 según documentación
   */
  async retiroCta(request: RetiroCtaRequestDto): Promise<RetiroCtaResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.retiroCta(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(`Enviando retiro a Byte - Cuenta: ${request.numCuenta}, Monto: ${request.montoRetiro}`);

      const payload = {
        retiroCta_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numCuenta: request.numCuenta,
            montoRetiro: request.montoRetiro.toString(),
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/retiroCta`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.retiroCta_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
        numCuenta: byteResponse.detalle.numCuenta || request.numCuenta,
        nuevoSaldo: parseFloat(byteResponse.detalle.nuevoSaldo || '0'),
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Consulta de Saldos de Cuenta
   * Componente #004 según documentación
   */
  async consultaCta(request: ConsultaCtaRequestDto): Promise<ConsultaCtaResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.consultaCta(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(`Consultando saldos en Byte - Cuenta: ${request.numCuenta}`);

      const payload = {
        consultaCta_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numCuenta: request.numCuenta,
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/consultaCta`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.consultaCta_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Saldo disponible: ${byteResponse.detalle.saldoDisponible}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        estadoCuenta: byteResponse.detalle.estadoCuenta || '',
        fechaUltMov: byteResponse.detalle.fechaUltMov || '',
        saldoTotal: parseFloat(byteResponse.detalle.saldoTotal || '0'),
        saldoDisponible: parseFloat(byteResponse.detalle.saldoDisponible || '0'),
        saldoReservas: parseFloat(byteResponse.detalle.saldoReservas || '0'),
        saldoBloqueos: parseFloat(byteResponse.detalle.saldoBloqueos || '0'),
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Transferencia entre Cuentas (Propias y Terceros)
   * Componente #005 según documentación
   */
  async transferCta(request: TransferCtaRequestDto): Promise<TransferCtaResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.transferCta(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(
        `Enviando transferencia a Byte - Origen: ${request.numCuentaOrigen}, ` +
        `Destino: ${request.numCuentaDestino}, Monto: ${request.montoTransferencia}`
      );

      const payload = {
        transferCta_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numCuentaOrigen: request.numCuentaOrigen,
            numCuentaDestino: request.numCuentaDestino,
            montoTransferencia: request.montoTransferencia.toString(),
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/transferCta`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.consultaCta_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Consulta de Saldo de Préstamo
   * Componente #006 según documentación
   */
  async consultaPrestamo(request: ConsultaPrestamoRequestDto): Promise<ConsultaPrestamoResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.consultaPrestamo(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(`Enviando consulta de préstamo a Byte - Préstamo: ${request.numPrestamo}`);

      const payload = {
        consultaPrestamo_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numPrestamo: request.numPrestamo,
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/consultaPrestamo`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.consultaPrestamo_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}, ` +
        `Saldo Total: ${byteResponse.detalle.saldoTotal}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        numPrestamo: byteResponse.detalle.numPrestamo,
        saldoCapital: parseFloat(byteResponse.detalle.saldoCapital) || 0,
        saldoInteres: parseFloat(byteResponse.detalle.saldoInteres) || 0,
        saldoMora: parseFloat(byteResponse.detalle.saldoMora) || 0,
        saldoTotal: parseFloat(byteResponse.detalle.saldoTotal) || 0,
        proximoPago: parseFloat(byteResponse.detalle.proximoPago) || 0,
        fechaProximoPago: byteResponse.detalle.fechaProximoPago || '',
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Pago de Préstamo con Múltiples Métodos de Pago
   * Componente #007 según documentación
   */
  async pagoPrestamo(request: PagoPrestamoRequestDto): Promise<PagoPrestamoResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.pagoPrestamo(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(
        `Enviando pago de préstamo a Byte - Préstamo: ${request.numPrestamo}, ` +
        `Monto: ${request.montoTotal}`
      );

      const payload = {
        pagoPrestamo_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numPrestamo: request.numPrestamo,
            numCuenta: request.numCuenta || '',
            montoDebito: request.montoDebito?.toString() || '0',
            montoEfectivo: request.montoEfectivo?.toString() || '0',
            montoCheque: request.montoCheque?.toString() || '0',
            montoTotal: request.montoTotal.toString(),
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/pagoPrestamo`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.pagoPrestamo_response;

      this.logger.log(
        `Respuesta Byte - Autorización: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}, ` +
        `Nuevo Saldo: ${byteResponse.detalle.nuevoSaldo}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        numPrestamo: byteResponse.detalle.numPrestamo,
        nuevoSaldo: parseFloat(byteResponse.detalle.nuevoSaldo) || 0,
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Reversa de Pago de Préstamo
   * Componente #008 según documentación
   */
  async reversaPagoPrestamo(request: ReversaPagoPrestamoRequestDto): Promise<ReversaPagoPrestamoResponseDto> {
    // Si estamos en modo mock, usar el servicio simulado
    if (this.useMock) {
      return this.byteMockService.reversaPagoPrestamo(request);
    }

    // Llamada real al servicio Byte
    try {
      this.logger.log(
        `Enviando reversa de pago a Byte - Préstamo: ${request.numPrestamo}, ` +
        `Autorización Original: ${request.autorizacionOriginal}`
      );

      const payload = {
        reversaPagoPrestamo_request: {
          infoTx: {
            idTransaccion: request.idTransaccion,
          },
          detalle: {
            numPrestamo: request.numPrestamo,
            autorizacionOriginal: request.autorizacionOriginal,
            motivo: request.motivo,
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.urlByte}/reversaPagoPrestamo`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        })
      );

      const byteResponse = response.data.reversaPagoPrestamo_response;

      this.logger.log(
        `Respuesta Byte - Autorización Reversa: ${byteResponse.detalle.autorizacion}, ` +
        `Código: ${byteResponse.detalle.codRespuesta}, ` +
        `Monto Reversado: ${byteResponse.detalle.montoReversado}`
      );

      return {
        idTransaccion: byteResponse.infoTx.idTransaccion,
        autorizacion: byteResponse.detalle.autorizacion || '',
        numPrestamo: byteResponse.detalle.numPrestamo,
        numCuenta: byteResponse.detalle.numCuenta || undefined,
        nuevoSaldo: parseFloat(byteResponse.detalle.nuevoSaldo) || 0,
        montoReversado: parseFloat(byteResponse.detalle.montoReversado) || 0,
        codRespuesta: byteResponse.detalle.codRespuesta || '0',
        descRespuesta: byteResponse.detalle.descRespuesta || '',
      };
    } catch (error) {
      this.logger.error(`Error en comunicación con Byte: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          message: 'Error al comunicarse con el servicio Byte',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
