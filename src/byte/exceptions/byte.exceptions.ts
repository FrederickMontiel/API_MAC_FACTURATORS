import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción base para errores relacionados con Byte
 */
export class ByteException extends HttpException {
  constructor(
    message: string,
    public readonly byteCode: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode: status,
        message,
        byteCode,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

/**
 * Cuenta no encontrada en el sistema Byte
 */
export class AccountNotFoundException extends ByteException {
  constructor(numCuenta: string) {
    super(
      `Cuenta ${numCuenta} no existe en el sistema`,
      'BYTE_001',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Saldo insuficiente para realizar la operación
 */
export class InsufficientBalanceException extends ByteException {
  constructor(numCuenta: string, saldoDisponible: number, montoRequerido: number) {
    super(
      `Saldo insuficiente en cuenta ${numCuenta}. Disponible: Q${saldoDisponible.toFixed(2)}, Requerido: Q${montoRequerido.toFixed(2)}`,
      'BYTE_003',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Préstamo no encontrado en el sistema
 */
export class LoanNotFoundException extends ByteException {
  constructor(numPrestamo: string) {
    super(
      `Préstamo ${numPrestamo} no existe en el sistema`,
      'BYTE_001',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Transacción inválida o no permitida
 */
export class InvalidTransactionException extends ByteException {
  constructor(message: string, code: string = 'BYTE_002') {
    super(message, code, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Cuenta inactiva o bloqueada
 */
export class AccountInactiveException extends ByteException {
  constructor(numCuenta: string) {
    super(
      `Cuenta ${numCuenta} está inactiva o bloqueada`,
      'BYTE_007',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Error de comunicación con el servicio Byte
 */
export class ByteServiceUnavailableException extends ByteException {
  constructor(originalError?: string) {
    super(
      `Servicio Byte no disponible temporalmente${originalError ? ': ' + originalError : ''}`,
      'BYTE_503',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Timeout en la comunicación con Byte
 */
export class ByteTimeoutException extends ByteException {
  constructor() {
    super(
      'Tiempo de espera agotado al comunicarse con Byte',
      'BYTE_TIMEOUT',
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

/**
 * Transacción duplicada
 */
export class DuplicateTransactionException extends ByteException {
  constructor(idTransaccion: string) {
    super(
      `La transacción ${idTransaccion} ya fue procesada anteriormente`,
      'BYTE_DUPLICATE',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Monto inválido o fuera de rango
 */
export class InvalidAmountException extends ByteException {
  constructor(message: string) {
    super(message, 'BYTE_AMOUNT', HttpStatus.BAD_REQUEST);
  }
}

/**
 * Autorización no encontrada para reversa
 */
export class AuthorizationNotFoundException extends ByteException {
  constructor(autorizacion: string) {
    super(
      `Autorización ${autorizacion} no encontrada o ya fue reversada`,
      'BYTE_AUTH_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Operación no permitida
 */
export class OperationNotAllowedException extends ByteException {
  constructor(message: string) {
    super(message, 'BYTE_NOT_ALLOWED', HttpStatus.FORBIDDEN);
  }
}
