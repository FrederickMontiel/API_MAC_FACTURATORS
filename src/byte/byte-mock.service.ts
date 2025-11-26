import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import {
  AccountNotFoundException,
  InsufficientBalanceException,
  LoanNotFoundException,
  InvalidAmountException,
  InvalidTransactionException,
  AuthorizationNotFoundException,
  DuplicateTransactionException,
} from './exceptions';

/**
 * Simulador del servicio Byte para desarrollo y testing
 * Simula las respuestas del Core bancario sin conexión real
 */
@Injectable()
export class ByteMockService {
  private readonly logger = new Logger(ByteMockService.name);
  private readonly useMock: boolean;

  // Cuentas de prueba con saldos iniciales
  private cuentasSimuladas = new Map<string, number>([
    ['1234567890', 5000.00],
    ['0987654321', 10000.00],
    ['1111111111', 500.00],
    ['2222222222', 0.00],
  ]);

  // Préstamos de prueba con datos simulados
  private prestamosSimulados = new Map<string, any>([
    ['PRES-0001234567', {
      saldoCapital: 25000.00,
      saldoInteres: 1250.00,
      saldoMora: 150.00,
      proximoPago: 1500.00,
      fechaProximoPago: '15/12/2025',
    }],
    ['PRES-0009876543', {
      saldoCapital: 50000.00,
      saldoInteres: 2500.00,
      saldoMora: 0.00,
      proximoPago: 3000.00,
      fechaProximoPago: '01/01/2026',
    }],
    ['PRES-0001111111', {
      saldoCapital: 5000.00,
      saldoInteres: 250.00,
      saldoMora: 50.00,
      proximoPago: 500.00,
      fechaProximoPago: '10/12/2025',
    }],
    ['PRES-0002222222', {
      saldoCapital: 0.00,
      saldoInteres: 0.00,
      saldoMora: 0.00,
      proximoPago: 0.00,
      fechaProximoPago: '',
    }],
  ]);

  // Registro de transacciones para reversas
  private transaccionesRegistradas = new Map<string, any>();

  constructor(private configService: ConfigService) {
    // Usar mock en desarrollo o si URL_BYTE no está configurada
    const urlByte = this.configService.get<string>('URL_BYTE');
    this.useMock = !urlByte || urlByte.includes('localhost');
    
    if (this.useMock) {
      this.logger.warn('🔧 ByteMockService activo - Usando respuestas simuladas');
    }
  }

  /**
   * Simula un depósito a cuenta con efectivo o cheque
   */
  async depositoCta(request: DepositoCtaRequestDto): Promise<DepositoCtaResponseDto> {
    this.logger.debug(`Mock: Procesando depósito para cuenta ${request.numCuenta}`);

    // Simular latencia de red
    await this.delay(500);

    // Validar que la cuenta existe
    if (!this.cuentasSimuladas.has(request.numCuenta)) {
      throw new AccountNotFoundException(request.numCuenta);
    }

    // Validar que el monto total coincide
    const sumaMontos = (request.montoEfectivo || 0) + (request.montoCheque || 0);
    if (Math.abs(sumaMontos - request.montoTotal) > 0.01) {
      throw new InvalidAmountException(
        `El monto total (Q${request.montoTotal.toFixed(2)}) no coincide con la suma de efectivo (Q${(request.montoEfectivo || 0).toFixed(2)}) y cheque (Q${(request.montoCheque || 0).toFixed(2)})`
      );
    }

    // Validar que hay al menos un método de pago
    if ((request.montoEfectivo || 0) === 0 && (request.montoCheque || 0) === 0) {
      throw new InvalidAmountException('Debe especificar al menos un método de pago (efectivo o cheque)');
    }

    // Simular éxito
    const saldoActual = this.cuentasSimuladas.get(request.numCuenta)!;
    const nuevoSaldo = saldoActual + request.montoTotal;
    this.cuentasSimuladas.set(request.numCuenta, nuevoSaldo);

    const autorizacion = this.generarAutorizacion();

    this.logger.log(
      `Mock: Depósito exitoso - Cuenta: ${request.numCuenta}, ` +
      `Monto: ${request.montoTotal}, Nuevo saldo: ${nuevoSaldo}, ` +
      `Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      codRespuesta: '0',
      descRespuesta: 'Transacción exitosa',
      numCuenta: request.numCuenta,
      nuevoSaldo,
    };
  }

  /**
   * Simula un retiro de efectivo de cuenta de ahorro
   */
  async retiroCta(request: RetiroCtaRequestDto): Promise<RetiroCtaResponseDto> {
    this.logger.debug(`Mock: Procesando retiro para cuenta ${request.numCuenta}`);

    // Simular latencia de red
    await this.delay(500);

    // Validar que la cuenta existe
    if (!this.cuentasSimuladas.has(request.numCuenta)) {
      throw new AccountNotFoundException(request.numCuenta);
    }

    const saldoActual = this.cuentasSimuladas.get(request.numCuenta)!;

    // Validar saldo suficiente
    if (saldoActual < request.montoRetiro) {
      throw new InsufficientBalanceException(request.numCuenta, saldoActual, request.montoRetiro);
    }

    // Simular éxito
    const nuevoSaldo = saldoActual - request.montoRetiro;
    this.cuentasSimuladas.set(request.numCuenta, nuevoSaldo);

    const autorizacion = this.generarAutorizacion();

    this.logger.log(
      `Mock: Retiro exitoso - Cuenta: ${request.numCuenta}, ` +
      `Monto: ${request.montoRetiro}, Nuevo saldo: ${nuevoSaldo}, ` +
      `Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      codRespuesta: '0',
      descRespuesta: 'Transacción exitosa',
      numCuenta: request.numCuenta,
      nuevoSaldo,
    };
  }

  /**
   * Simula una consulta de saldos de cuenta
   */
  async consultaCta(request: ConsultaCtaRequestDto): Promise<ConsultaCtaResponseDto> {
    this.logger.debug(`Mock: Consultando saldos para cuenta ${request.numCuenta}`);

    // Simular latencia de red
    await this.delay(300);

    // Validar que la cuenta existe
    if (!this.cuentasSimuladas.has(request.numCuenta)) {
      throw new AccountNotFoundException(request.numCuenta);
    }

    const saldoActual = this.cuentasSimuladas.get(request.numCuenta)!;
    const autorizacion = this.generarAutorizacion();

    // Simular reservas y bloqueos (10% del saldo como reservas, 5% como bloqueos)
    const reservas = Math.round(saldoActual * 0.10 * 100) / 100;
    const bloqueos = Math.round(saldoActual * 0.05 * 100) / 100;
    const disponible = Math.round((saldoActual - reservas - bloqueos) * 100) / 100;

    this.logger.log(
      `Mock: Consulta exitosa - Cuenta: ${request.numCuenta}, ` +
      `Saldo total: ${saldoActual}, Disponible: ${disponible}, ` +
      `Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      estadoCuenta: 'ACTIVA',
      fechaUltMov: new Date().toISOString().split('T')[0],
      saldoTotal: saldoActual,
      saldoDisponible: disponible,
      saldoReservas: reservas,
      saldoBloqueos: bloqueos,
      codRespuesta: '0',
      descRespuesta: 'Consulta exitosa',
    };
  }

  /**
   * Simula una transferencia entre cuentas (propias o terceros)
   */
  async transferCta(request: TransferCtaRequestDto): Promise<TransferCtaResponseDto> {
    this.logger.debug(
      `Mock: Procesando transferencia de ${request.numCuentaOrigen} ` +
      `a ${request.numCuentaDestino} por ${request.montoTransferencia}`
    );

    // Simular latencia de red
    await this.delay(600);

    // Validar que no sean la misma cuenta
    if (request.numCuentaOrigen === request.numCuentaDestino) {
      throw new InvalidTransactionException('No se puede transferir a la misma cuenta', 'BYTE_004');
    }

    // Validar que la cuenta origen existe
    if (!this.cuentasSimuladas.has(request.numCuentaOrigen)) {
      throw new AccountNotFoundException(request.numCuentaOrigen);
    }

    // Validar que la cuenta destino existe
    if (!this.cuentasSimuladas.has(request.numCuentaDestino)) {
      throw new AccountNotFoundException(request.numCuentaDestino);
    }

    const saldoOrigen = this.cuentasSimuladas.get(request.numCuentaOrigen)!;

    // Validar saldo suficiente
    if (saldoOrigen < request.montoTransferencia) {
      throw new InsufficientBalanceException(request.numCuentaOrigen, saldoOrigen, request.montoTransferencia);
    }

    // Realizar transferencia
    const nuevoSaldoOrigen = saldoOrigen - request.montoTransferencia;
    const saldoDestino = this.cuentasSimuladas.get(request.numCuentaDestino)!;
    const nuevoSaldoDestino = saldoDestino + request.montoTransferencia;

    this.cuentasSimuladas.set(request.numCuentaOrigen, nuevoSaldoOrigen);
    this.cuentasSimuladas.set(request.numCuentaDestino, nuevoSaldoDestino);

    const autorizacion = this.generarAutorizacion();

    this.logger.log(
      `Mock: Transferencia exitosa - Origen: ${request.numCuentaOrigen} (${nuevoSaldoOrigen}), ` +
      `Destino: ${request.numCuentaDestino} (${nuevoSaldoDestino}), ` +
      `Monto: ${request.montoTransferencia}, Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      codRespuesta: '0',
      descRespuesta: 'Transferencia exitosa',
    };
  }

  /**
   * Genera un número de autorización simulado
   */
  private generarAutorizacion(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AUTH${timestamp}${random}`;
  }

  /**
   * Simula latencia de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simula consulta de saldo de préstamo
   */
  async consultaPrestamo(request: ConsultaPrestamoRequestDto): Promise<ConsultaPrestamoResponseDto> {
    this.logger.debug(`Mock: Consultando préstamo ${request.numPrestamo}`);

    // Simular latencia de red
    await this.delay(400);

    // Validar que el préstamo existe
    if (!this.prestamosSimulados.has(request.numPrestamo)) {
      throw new LoanNotFoundException(request.numPrestamo);
    }

    // Obtener datos del préstamo
    const prestamo = this.prestamosSimulados.get(request.numPrestamo)!;
    const saldoTotal = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;
    const autorizacion = this.generarAutorizacion();

    this.logger.log(
      `Mock: Consulta exitosa - Préstamo: ${request.numPrestamo}, ` +
      `Saldo Capital: ${prestamo.saldoCapital}, Saldo Interés: ${prestamo.saldoInteres}, ` +
      `Saldo Mora: ${prestamo.saldoMora}, Saldo Total: ${saldoTotal}, ` +
      `Próximo Pago: ${prestamo.proximoPago}, Fecha: ${prestamo.fechaProximoPago}, ` +
      `Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      numPrestamo: request.numPrestamo,
      saldoCapital: prestamo.saldoCapital,
      saldoInteres: prestamo.saldoInteres,
      saldoMora: prestamo.saldoMora,
      saldoTotal,
      proximoPago: prestamo.proximoPago,
      fechaProximoPago: prestamo.fechaProximoPago,
      codRespuesta: '0',
      descRespuesta: 'Consulta exitosa',
    };
  }

  /**
   * Simula pago de préstamo con múltiples métodos de pago
   */
  async pagoPrestamo(request: PagoPrestamoRequestDto): Promise<PagoPrestamoResponseDto> {
    this.logger.debug(`Mock: Procesando pago de préstamo ${request.numPrestamo}`);

    // Simular latencia de red
    await this.delay(600);

    // Validar que el préstamo existe
    if (!this.prestamosSimulados.has(request.numPrestamo)) {
      throw new LoanNotFoundException(request.numPrestamo);
    }

    // Validar que el monto total coincide con suma de métodos de pago
    const sumaMetodosPago = (request.montoDebito || 0) + (request.montoEfectivo || 0) + (request.montoCheque || 0);
    if (Math.abs(sumaMetodosPago - request.montoTotal) > 0.01) {
      throw new InvalidAmountException(
        `El monto total (Q${request.montoTotal.toFixed(2)}) no coincide con la suma de débito (Q${(request.montoDebito || 0).toFixed(2)}), efectivo (Q${(request.montoEfectivo || 0).toFixed(2)}) y cheque (Q${(request.montoCheque || 0).toFixed(2)})`
      );
    }

    // Validar que hay al menos un método de pago
    if (sumaMetodosPago === 0) {
      throw new InvalidAmountException('Debe especificar al menos un método de pago');
    }

    // Si se usa débito de cuenta, validar cuenta y saldo
    if (request.montoDebito && request.montoDebito > 0) {
      if (!request.numCuenta) {
        throw new InvalidTransactionException('Número de cuenta requerido cuando se especifica monto a debitar', 'BYTE_003');
      }

      if (!this.cuentasSimuladas.has(request.numCuenta)) {
        throw new AccountNotFoundException(request.numCuenta);
      }

      const saldoCuenta = this.cuentasSimuladas.get(request.numCuenta)!;
      if (saldoCuenta < request.montoDebito) {
        throw new InsufficientBalanceException(request.numCuenta, saldoCuenta, request.montoDebito);
      }

      // Debitar de la cuenta
      this.cuentasSimuladas.set(request.numCuenta, saldoCuenta - request.montoDebito);
    }

    // Obtener préstamo y calcular nuevo saldo
    const prestamo = this.prestamosSimulados.get(request.numPrestamo)!;
    const saldoActual = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;

    if (request.montoTotal > saldoActual) {
      throw new InvalidAmountException(
        `El monto de pago (Q${request.montoTotal.toFixed(2)}) excede el saldo del préstamo (Q${saldoActual.toFixed(2)})`
      );
    }

    // Aplicar pago (primero mora, luego interés, luego capital)
    let montoRestante = request.montoTotal;

    // Pagar mora
    if (prestamo.saldoMora > 0) {
      const pagoMora = Math.min(montoRestante, prestamo.saldoMora);
      prestamo.saldoMora -= pagoMora;
      montoRestante -= pagoMora;
    }

    // Pagar interés
    if (montoRestante > 0 && prestamo.saldoInteres > 0) {
      const pagoInteres = Math.min(montoRestante, prestamo.saldoInteres);
      prestamo.saldoInteres -= pagoInteres;
      montoRestante -= pagoInteres;
    }

    // Pagar capital
    if (montoRestante > 0 && prestamo.saldoCapital > 0) {
      const pagoCapital = Math.min(montoRestante, prestamo.saldoCapital);
      prestamo.saldoCapital -= pagoCapital;
      montoRestante -= pagoCapital;
    }

    const nuevoSaldo = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;
    const autorizacion = this.generarAutorizacion();

    // Registrar transacción para posibles reversas
    this.transaccionesRegistradas.set(autorizacion, {
      tipo: 'PAGO_PRESTAMO',
      numPrestamo: request.numPrestamo,
      numCuenta: request.numCuenta,
      montoDebito: request.montoDebito || 0,
      montoEfectivo: request.montoEfectivo || 0,
      montoCheque: request.montoCheque || 0,
      montoTotal: request.montoTotal,
      timestamp: new Date(),
    });

    this.logger.log(
      `Mock: Pago exitoso - Préstamo: ${request.numPrestamo}, ` +
      `Monto Pagado: ${request.montoTotal}, Nuevo Saldo: ${nuevoSaldo}, ` +
      `Métodos: Débito=${request.montoDebito || 0}, Efectivo=${request.montoEfectivo || 0}, ` +
      `Cheque=${request.montoCheque || 0}, Autorización: ${autorizacion}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      numPrestamo: request.numPrestamo,
      nuevoSaldo,
      codRespuesta: '0',
      descRespuesta: 'Pago aplicado exitosamente',
    };
  }

  /**
   * Simula reversa de pago de préstamo
   */
  async reversaPagoPrestamo(request: ReversaPagoPrestamoRequestDto): Promise<ReversaPagoPrestamoResponseDto> {
    this.logger.debug(`Mock: Procesando reversa de pago para préstamo ${request.numPrestamo}`);

    // Simular latencia de red
    await this.delay(500);

    // Validar que el préstamo existe
    if (!this.prestamosSimulados.has(request.numPrestamo)) {
      throw new LoanNotFoundException(request.numPrestamo);
    }

    // Validar que la transacción original existe
    const transaccionOriginal = this.transaccionesRegistradas.get(request.autorizacionOriginal);
    if (!transaccionOriginal) {
      throw new AuthorizationNotFoundException(request.autorizacionOriginal);
    }

    // Validar que la transacción original es del mismo préstamo
    if (transaccionOriginal.numPrestamo !== request.numPrestamo) {
      throw new InvalidTransactionException(
        `La autorización ${request.autorizacionOriginal} no corresponde al préstamo ${request.numPrestamo}`,
        'BYTE_003'
      );
    }

    // Validar que no haya sido reversada previamente
    if (transaccionOriginal.reversada) {
      throw new DuplicateTransactionException(request.idTransaccion);
    }

    // Obtener préstamo y restaurar saldos
    const prestamo = this.prestamosSimulados.get(request.numPrestamo)!;
    const montoReversado = transaccionOriginal.montoTotal;

    // Restaurar el monto al préstamo (en orden inverso: capital → interés → mora)
    let montoRestante = montoReversado;

    // Restaurar capital (lo que se pagó último)
    const capitalPagado = Math.min(montoRestante, montoReversado);
    prestamo.saldoCapital += capitalPagado;
    montoRestante -= capitalPagado;

    // Restaurar interés (si hubo pago de interés)
    if (montoRestante > 0) {
      const interesPagado = Math.min(montoRestante, montoReversado);
      prestamo.saldoInteres += interesPagado;
      montoRestante -= interesPagado;
    }

    // Restaurar mora (si hubo pago de mora)
    if (montoRestante > 0) {
      prestamo.saldoMora += montoRestante;
    }

    // Si hubo débito de cuenta, devolver el monto
    if (transaccionOriginal.montoDebito > 0 && transaccionOriginal.numCuenta) {
      if (this.cuentasSimuladas.has(transaccionOriginal.numCuenta)) {
        const saldoCuenta = this.cuentasSimuladas.get(transaccionOriginal.numCuenta)!;
        this.cuentasSimuladas.set(
          transaccionOriginal.numCuenta,
          saldoCuenta + transaccionOriginal.montoDebito
        );
      }
    }

    const nuevoSaldo = prestamo.saldoCapital + prestamo.saldoInteres + prestamo.saldoMora;
    const autorizacion = this.generarAutorizacion();

    // Marcar transacción como reversada
    transaccionOriginal.reversada = true;
    transaccionOriginal.autorizacionReversa = autorizacion;
    transaccionOriginal.motivoReversa = request.motivo;

    this.logger.log(
      `Mock: Reversa exitosa - Préstamo: ${request.numPrestamo}, ` +
      `Monto Reversado: ${montoReversado}, Nuevo Saldo: ${nuevoSaldo}, ` +
      `Autorización Original: ${request.autorizacionOriginal}, ` +
      `Autorización Reversa: ${autorizacion}, Motivo: ${request.motivo}`
    );

    return {
      idTransaccion: request.idTransaccion,
      autorizacion,
      numPrestamo: request.numPrestamo,
      numCuenta: transaccionOriginal.numCuenta,
      nuevoSaldo,
      montoReversado,
      codRespuesta: '0',
      descRespuesta: 'Reversa aplicada exitosamente',
    };
  }

  /**
   * Reinicia los saldos de las cuentas de prueba (útil para testing)
   */
  resetCuentas(): void {
    this.cuentasSimuladas = new Map<string, number>([
      ['1234567890', 5000.00],
      ['0987654321', 10000.00],
      ['1111111111', 500.00],
      ['2222222222', 0.00],
    ]);
    this.logger.log('Mock: Cuentas reseteadas a valores iniciales');
  }

  /**
   * Obtiene el saldo actual de una cuenta (solo para testing)
   */
  getSaldo(numCuenta: string): number | undefined {
    return this.cuentasSimuladas.get(numCuenta);
  }

  /**
   * Obtiene los datos actuales de un préstamo (solo para testing)
   */
  getPrestamo(numPrestamo: string): any {
    return this.prestamosSimulados.get(numPrestamo);
  }
}
