# Módulo Byte - Pago de Préstamo

## Descripción

El componente de pago de préstamo permite aplicar abonos o pagos completos a un préstamo utilizando múltiples métodos de pago: débito de cuenta, efectivo y/o cheque. El sistema aplica el pago en orden de prioridad: primero mora, luego intereses y finalmente capital. Este módulo implementa el **Componente #007** de la especificación Byte.

## API Endpoint

### POST /byte/pago-prestamo

Aplica un pago a un préstamo utilizando uno o más métodos de pago.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-PAGO-001",
  "numPrestamo": "PRES-0001234567",
  "numCuenta": "1234567890",
  "montoDebito": 500.00,
  "montoEfectivo": 300.00,
  "montoCheque": 200.00,
  "montoTotal": 1000.00
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numPrestamo` | string | Sí | Número de préstamo al que se aplicará el pago |
| `numCuenta` | string | Condicional | Número de cuenta para débito (requerido si montoDebito > 0) |
| `montoDebito` | number | No | Monto a debitar de la cuenta (≥ 0) |
| `montoEfectivo` | number | No | Monto pagado en efectivo (≥ 0) |
| `montoCheque` | number | No | Monto pagado con cheque (≥ 0) |
| `montoTotal` | number | Sí | Monto total del pago (> 0, debe ser suma de los métodos) |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-PAGO-001",
  "autorizacion": "AUTH12345678901234",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 25400.00,
  "codRespuesta": "0",
  "descRespuesta": "Pago aplicado exitosamente"
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción (mismo del request) |
| `autorizacion` | string | Número de autorización generado por el Core |
| `numPrestamo` | string | Número de préstamo pagado |
| `nuevoSaldo` | number | Saldo pendiente después del pago |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Pago aplicado exitosamente |
| `001` | Préstamo no existe |
| `002` | Monto total no coincide con suma de métodos de pago |
| `003` | Número de cuenta requerido para débito |
| `004` | Cuenta para débito no existe |
| `005` | Saldo insuficiente en cuenta |
| `006` | Monto de pago excede saldo del préstamo |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Orden de Aplicación del Pago

El pago se aplica automáticamente en el siguiente orden:

1. **Mora**: Se paga primero la mora acumulada
2. **Intereses**: Luego se abonan los intereses pendientes
3. **Capital**: Finalmente se reduce el capital

### Ejemplo de Aplicación

**Saldos iniciales:**
- Capital: Q25,000
- Interés: Q1,250
- Mora: Q150
- **Total: Q26,400**

**Pago de Q1,500:**
1. Mora: Q150 → **Q0** (aplica Q150)
2. Interés: Q1,250 → **Q900** (aplica Q350)
3. Capital: Q25,000 → **Q24,000** (aplica Q1,000)
4. **Nuevo saldo total: Q24,900**

## Ejemplos de Uso

### Ejemplo 1: Pago Solo con Débito de Cuenta

```bash
curl -X POST http://localhost:3508/byte/pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PAGO-001",
    "numPrestamo": "PRES-0001234567",
    "numCuenta": "1234567890",
    "montoDebito": 1500.00,
    "montoTotal": 1500.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PAGO-001",
  "autorizacion": "AUTH12345678901234",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 24900.00,
  "codRespuesta": "0",
  "descRespuesta": "Pago aplicado exitosamente"
}
```

### Ejemplo 2: Pago Solo en Efectivo

```bash
curl -X POST http://localhost:3508/byte/pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PAGO-002",
    "numPrestamo": "PRES-0001234567",
    "montoEfectivo": 500.00,
    "montoTotal": 500.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PAGO-002",
  "autorizacion": "AUTH12345678901235",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 25900.00,
  "codRespuesta": "0",
  "descRespuesta": "Pago aplicado exitosamente"
}
```

### Ejemplo 3: Pago Mixto (Débito + Efectivo + Cheque)

```bash
curl -X POST http://localhost:3508/byte/pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PAGO-003",
    "numPrestamo": "PRES-0001234567",
    "numCuenta": "1234567890",
    "montoDebito": 500.00,
    "montoEfectivo": 300.00,
    "montoCheque": 200.00,
    "montoTotal": 1000.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PAGO-003",
  "autorizacion": "AUTH12345678901236",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 25400.00,
  "codRespuesta": "0",
  "descRespuesta": "Pago aplicado exitosamente"
}
```

### Ejemplo 4: Pago Total (Cancelación)

```bash
curl -X POST http://localhost:3508/byte/pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PAGO-004",
    "numPrestamo": "PRES-0001111111",
    "numCuenta": "0987654321",
    "montoDebito": 5300.00,
    "montoTotal": 5300.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PAGO-004",
  "autorizacion": "AUTH12345678901237",
  "numPrestamo": "PRES-0001111111",
  "nuevoSaldo": 0.00,
  "codRespuesta": "0",
  "descRespuesta": "Pago aplicado exitosamente"
}
```

### Ejemplo 5: Error - Saldo Insuficiente

```bash
curl -X POST http://localhost:3508/byte/pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PAGO-005",
    "numPrestamo": "PRES-0001234567",
    "numCuenta": "1111111111",
    "montoDebito": 1000.00,
    "montoTotal": 1000.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PAGO-005",
  "autorizacion": "",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 0.00,
  "codRespuesta": "005",
  "descRespuesta": "Saldo insuficiente en cuenta"
}
```

## Modo Mock

### Comportamiento del Mock

- **Latencia simulada**: 600ms para imitar procesamiento de pago
- **Validación completa**: Préstamo, cuenta, saldo, suma de montos
- **Orden de aplicación**: Mora → Interés → Capital
- **Actualización de saldos**: Débito de cuenta y reducción de préstamo
- **No permite sobrepago**: Rechaza si monto > saldo del préstamo

### Préstamos de Prueba

| Número Préstamo | Capital | Interés | Mora | Total |
|-----------------|---------|---------|------|-------|
| PRES-0001234567 | Q25,000 | Q1,250 | Q150 | Q26,400 |
| PRES-0009876543 | Q50,000 | Q2,500 | Q0 | Q52,500 |
| PRES-0001111111 | Q5,000 | Q250 | Q50 | Q5,300 |

### Cuentas de Prueba

| Número Cuenta | Saldo Inicial |
|---------------|---------------|
| 1234567890 | Q5,000 |
| 0987654321 | Q10,000 |
| 1111111111 | Q500 |

## Integración con NestJS

### Ejemplo 1: Pago Automático Mensual

```typescript
import { Injectable } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PagoAutomaticoService {
  constructor(private byteService: ByteService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async procesarPagosAutomaticos() {
    const pagosHoy = await this.db.pagosAutomaticos.findMany({
      where: {
        fechaPago: new Date(),
        estado: 'PENDIENTE',
      },
    });

    for (const pago of pagosHoy) {
      try {
        // Consultar saldo del préstamo
        const consulta = await this.byteService.consultaPrestamo({
          idTransaccion: `AUTO-CONS-${pago.id}`,
          numPrestamo: pago.numPrestamo,
        });

        if (consulta.saldoTotal === 0) {
          await this.db.pagosAutomaticos.update(pago.id, {
            estado: 'CANCELADO',
            observacion: 'Préstamo ya cancelado',
          });
          continue;
        }

        // Aplicar pago
        const resultado = await this.byteService.pagoPrestamo({
          idTransaccion: `AUTO-${pago.id}-${Date.now()}`,
          numPrestamo: pago.numPrestamo,
          numCuenta: pago.numCuenta,
          montoDebito: Math.min(pago.montoPago, consulta.saldoTotal),
          montoTotal: Math.min(pago.montoPago, consulta.saldoTotal),
        });

        if (resultado.codRespuesta === '0') {
          await this.db.pagosAutomaticos.update(pago.id, {
            estado: 'APLICADO',
            autorizacion: resultado.autorizacion,
          });

          // Notificar al cliente
          await this.notificacionService.enviarEmail(pago.clienteId, {
            tipo: 'PAGO_AUTOMATICO_EXITOSO',
            monto: pago.montoPago,
            prestamo: pago.numPrestamo,
            nuevoSaldo: resultado.nuevoSaldo,
          });
        }
      } catch (error) {
        this.logger.error(`Error en pago automático ${pago.id}: ${error.message}`);
        await this.db.pagosAutomaticos.update(pago.id, {
          estado: 'ERROR',
          observacion: error.message,
        });
      }
    }
  }
}
```

### Ejemplo 2: Validar Monto Antes de Pagar

```typescript
async validarYPagarPrestamo(
  numPrestamo: string,
  numCuenta: string,
  montoPagar: number
) {
  // 1. Consultar saldo del préstamo
  const consultaPrestamo = await this.byteService.consultaPrestamo({
    idTransaccion: `VAL-${Date.now()}`,
    numPrestamo,
  });

  if (consultaPrestamo.codRespuesta !== '0') {
    throw new BadRequestException('Préstamo no encontrado');
  }

  if (consultaPrestamo.saldoTotal === 0) {
    throw new BadRequestException('El préstamo ya está cancelado');
  }

  // 2. Consultar saldo de la cuenta
  const consultaCuenta = await this.byteService.consultaCta({
    idTransaccion: `VAL-${Date.now()}`,
    numCuenta,
  });

  if (consultaCuenta.saldoDisponible < montoPagar) {
    throw new BadRequestException(
      `Saldo insuficiente. Disponible: Q${consultaCuenta.saldoDisponible}`
    );
  }

  // 3. Validar que no exceda saldo del préstamo
  if (montoPagar > consultaPrestamo.saldoTotal) {
    throw new BadRequestException(
      `Monto excede saldo del préstamo (Q${consultaPrestamo.saldoTotal})`
    );
  }

  // 4. Aplicar pago
  const resultado = await this.byteService.pagoPrestamo({
    idTransaccion: `PAGO-${Date.now()}`,
    numPrestamo,
    numCuenta,
    montoDebito: montoPagar,
    montoTotal: montoPagar,
  });

  if (resultado.codRespuesta !== '0') {
    throw new BadRequestException(resultado.descRespuesta);
  }

  return {
    autorizacion: resultado.autorizacion,
    nuevoSaldo: resultado.nuevoSaldo,
    mensaje: resultado.nuevoSaldo === 0 ? 'Préstamo cancelado' : 'Pago aplicado',
  };
}
```

### Ejemplo 3: Pago en Ventanilla (Mixto)

```typescript
async procesarPagoEnVentanilla(
  numPrestamo: string,
  metodoPago: {
    cuenta?: string;
    montoDebito?: number;
    efectivo?: number;
    cheque?: number;
  }
) {
  const montoTotal = 
    (metodoPago.montoDebito || 0) + 
    (metodoPago.efectivo || 0) + 
    (metodoPago.cheque || 0);

  if (montoTotal === 0) {
    throw new BadRequestException('Debe especificar al menos un monto');
  }

  // Validar que si hay débito, debe haber cuenta
  if ((metodoPago.montoDebito || 0) > 0 && !metodoPago.cuenta) {
    throw new BadRequestException('Debe especificar cuenta para débito');
  }

  const resultado = await this.byteService.pagoPrestamo({
    idTransaccion: `VENT-${Date.now()}`,
    numPrestamo,
    numCuenta: metodoPago.cuenta,
    montoDebito: metodoPago.montoDebito,
    montoEfectivo: metodoPago.efectivo,
    montoCheque: metodoPago.cheque,
    montoTotal,
  });

  // Registrar en caja
  await this.cajaService.registrarMovimiento({
    tipo: 'PAGO_PRESTAMO',
    efectivo: metodoPago.efectivo || 0,
    cheque: metodoPago.cheque || 0,
    autorizacion: resultado.autorizacion,
  });

  // Imprimir recibo
  await this.reciboService.generar({
    tipo: 'PAGO_PRESTAMO',
    prestamo: numPrestamo,
    monto: montoTotal,
    metodoPago: {
      debito: metodoPago.montoDebito || 0,
      efectivo: metodoPago.efectivo || 0,
      cheque: metodoPago.cheque || 0,
    },
    autorizacion: resultado.autorizacion,
    nuevoSaldo: resultado.nuevoSaldo,
  });

  return resultado;
}
```

### Ejemplo 4: Pago con Aplicación Específica

```typescript
async pagarConDistribucion(
  numPrestamo: string,
  distribucion: {
    mora?: number;
    interes?: number;
    capital?: number;
  }
) {
  const montoTotal = (distribucion.mora || 0) + (distribucion.interes || 0) + (distribucion.capital || 0);

  // Nota: El Core Byte aplica automáticamente en orden: mora → interés → capital
  // Este ejemplo es solo para validación y registro interno
  
  const consulta = await this.byteService.consultaPrestamo({
    idTransaccion: `VAL-${Date.now()}`,
    numPrestamo,
  });

  // Validar que la distribución solicitada es posible
  if ((distribucion.mora || 0) > consulta.saldoMora) {
    throw new BadRequestException('Monto de mora excede el saldo');
  }

  // El pago se enviará como monto total, el Core lo distribuye automáticamente
  const resultado = await this.byteService.pagoPrestamo({
    idTransaccion: `DIST-${Date.now()}`,
    numPrestamo,
    montoEfectivo: montoTotal,
    montoTotal,
  });

  // Registrar distribución esperada vs real
  await this.db.registroPagos.create({
    prestamo: numPrestamo,
    montoTotal,
    distribucionEsperada: distribucion,
    autorizacion: resultado.autorizacion,
    nuevoSaldo: resultado.nuevoSaldo,
  });

  return resultado;
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "pagoPrestamo_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-PAGO-001"
    },
    "detalle": {
      "numPrestamo": "PRES-0001234567",
      "numCuenta": "1234567890",
      "montoDebito": "500.00",
      "montoEfectivo": "300.00",
      "montoCheque": "200.00",
      "montoTotal": "1000.00"
    }
  }
}
```

### Response del Core

```json
{
  "pagoPrestamo_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-PAGO-001"
    },
    "detalle": {
      "autorizacion": "AUTH12345678901234",
      "numPrestamo": "PRES-0001234567",
      "nuevoSaldo": "25400.00",
      "codRespuesta": "0",
      "descRespuesta": "Pago aplicado exitosamente"
    }
  }
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - pagoPrestamo', () => {
  let service: ByteMockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ByteMockService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:4000'),
          },
        },
      ],
    }).compile();

    service = module.get<ByteMockService>(ByteMockService);
    service.resetCuentas();
  });

  it('debe aplicar pago con débito exitosamente', async () => {
    const resultado = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-001',
      numPrestamo: 'PRES-0001234567',
      numCuenta: '1234567890',
      montoDebito: 1500,
      montoTotal: 1500,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.nuevoSaldo).toBe(24900); // 26400 - 1500
    expect(service.getSaldo('1234567890')).toBe(3500); // 5000 - 1500
  });

  it('debe aplicar pago solo en efectivo', async () => {
    const resultado = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-002',
      numPrestamo: 'PRES-0001234567',
      montoEfectivo: 500,
      montoTotal: 500,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.nuevoSaldo).toBe(25900);
  });

  it('debe aplicar pago mixto correctamente', async () => {
    const resultado = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-003',
      numPrestamo: 'PRES-0001234567',
      numCuenta: '1234567890',
      montoDebito: 500,
      montoEfectivo: 300,
      montoCheque: 200,
      montoTotal: 1000,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.nuevoSaldo).toBe(25400);
  });

  it('debe rechazar si monto total no coincide', async () => {
    const resultado = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-004',
      numPrestamo: 'PRES-0001234567',
      montoEfectivo: 500,
      montoTotal: 600, // No coincide
    });

    expect(resultado.codRespuesta).toBe('002');
  });

  it('debe rechazar si saldo insuficiente', async () => {
    const resultado = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-005',
      numPrestamo: 'PRES-0001234567',
      numCuenta: '1111111111', // Solo tiene Q500
      montoDebito: 1000,
      montoTotal: 1000,
    });

    expect(resultado.codRespuesta).toBe('005');
  });

  it('debe aplicar pago en orden: mora → interés → capital', async () => {
    // Préstamo PRES-0001234567: Mora Q150, Interés Q1250, Capital Q25000
    const prestamo = service.getPrestamo('PRES-0001234567');
    const moraInicial = prestamo.saldoMora;
    const interesInicial = prestamo.saldoInteres;

    // Pagar Q500 (debería pagar Q150 mora + Q350 interés)
    await service.pagoPrestamo({
      idTransaccion: 'TEST-ORDEN-001',
      numPrestamo: 'PRES-0001234567',
      montoEfectivo: 500,
      montoTotal: 500,
    });

    const prestamoActualizado = service.getPrestamo('PRES-0001234567');
    expect(prestamoActualizado.saldoMora).toBe(0); // Mora pagada
    expect(prestamoActualizado.saldoInteres).toBe(900); // 1250 - 350
  });
});
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numPrestamo`: No puede estar vacío
- `montoTotal`: Debe ser mayor a 0
- `montoDebito`, `montoEfectivo`, `montoCheque`: Deben ser ≥ 0
- Suma de métodos debe igualar `montoTotal`

### Validaciones de Negocio

- Préstamo debe existir
- Si `montoDebito > 0`, `numCuenta` es obligatorio
- Cuenta debe existir y tener saldo suficiente
- Monto no puede exceder saldo del préstamo
- Al menos un método de pago debe tener monto > 0

## Logs

### Mock Mode

```
[ByteMockService] Mock: Procesando pago de préstamo PRES-0001234567
[ByteMockService] Mock: Pago exitoso - Préstamo: PRES-0001234567, Monto Pagado: 1000, Nuevo Saldo: 25400, Métodos: Débito=500, Efectivo=300, Cheque=200, Autorización: AUTH12345678901234
```

### Real Mode

```
[ByteService] Enviando pago de préstamo a Byte - Préstamo: PRES-0001234567, Monto: 1000
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Código: 0, Nuevo Saldo: 25400
```

## Consideraciones de Seguridad

### Validación de Propiedad

```typescript
async pagarPrestamoSeguro(clienteId: string, numPrestamo: string, monto: number) {
  // Verificar que el préstamo pertenece al cliente
  const prestamo = await this.db.prestamos.findFirst({
    where: { numero: numPrestamo, clienteId },
  });

  if (!prestamo) {
    throw new ForbiddenException('No tiene acceso a este préstamo');
  }

  return this.byteService.pagoPrestamo({
    idTransaccion: `SEC-${clienteId}-${Date.now()}`,
    numPrestamo,
    montoEfectivo: monto,
    montoTotal: monto,
  });
}
```

### Auditoría Completa

```typescript
await this.auditService.registrar({
  tipo: 'PAGO_PRESTAMO',
  clienteId,
  prestamo: numPrestamo,
  monto: request.montoTotal,
  metodoPago: {
    debito: request.montoDebito || 0,
    efectivo: request.montoEfectivo || 0,
    cheque: request.montoCheque || 0,
  },
  autorizacion: resultado.autorizacion,
  nuevoSaldo: resultado.nuevoSaldo,
  ip: requestIp,
  timestamp: new Date(),
});
```

## Troubleshooting

### Monto No Coincide con Suma

**Causa**: Error de redondeo o cálculo incorrecto en frontend.

**Solución**:
- Usar `Math.round(monto * 100) / 100` para redondear
- Validar suma antes de enviar

### Débito No Se Aplica Pero Pago Sí

**Causa**: Fallo en transacción atómica.

**Solución**:
- Verificar logs del Core Byte
- Consultar ambos productos (préstamo y cuenta)
- Solicitar reversa si es necesario

### Pago Aplicado Pero Cliente No Ve Cambio

**Causa**: Cache o actualización pendiente.

**Solución**:
- Re-consultar préstamo para verificar
- Usar autorización para rastrear transacción
- Esperar sincronización (puede tomar minutos)

---

**Versión**: 1.0  
**Componente Byte**: #007  
**Última actualización**: Noviembre 2025
