# Módulo Byte - Reversa de Pago de Préstamo

## Descripción

El componente de reversa de pago permite anular un pago previamente aplicado a un préstamo, restaurando el saldo del préstamo y devolviendo el dinero debitado a la cuenta si aplica. Este proceso es crítico para corregir errores en la aplicación de pagos. Este módulo implementa el **Componente #008** de la especificación Byte.

## API Endpoint

### POST /byte/reversa-pago-prestamo

Reversa un pago previamente aplicado a un préstamo.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-REV-001",
  "numPrestamo": "PRES-0001234567",
  "autorizacionOriginal": "AUTH12345678901234",
  "motivo": "Error en aplicación de pago"
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único para la transacción de reversa |
| `numPrestamo` | string | Sí | Número de préstamo donde se aplicó el pago |
| `autorizacionOriginal` | string | Sí | Autorización del pago a reversar |
| `motivo` | string | Sí | Motivo de la reversa (auditoría) |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-REV-001",
  "autorizacion": "AUTH12345678901235",
  "numPrestamo": "PRES-0001234567",
  "numCuenta": "1234567890",
  "nuevoSaldo": 26400.00,
  "montoReversado": 1000.00,
  "codRespuesta": "0",
  "descRespuesta": "Reversa aplicada exitosamente"
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción de la reversa |
| `autorizacion` | string | Número de autorización de la reversa |
| `numPrestamo` | string | Número de préstamo |
| `numCuenta` | string | Cuenta donde se devolvió el débito (opcional) |
| `nuevoSaldo` | number | Saldo del préstamo después de la reversa |
| `montoReversado` | number | Monto total reversado |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Reversa aplicada exitosamente |
| `001` | Préstamo no existe |
| `002` | Transacción original no encontrada |
| `003` | La autorización no corresponde a este préstamo |
| `004` | La transacción ya fue reversada |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Proceso de Reversa

### Acciones Automáticas

1. **Validar transacción original**: Verifica que exista y pertenezca al préstamo
2. **Verificar no reversada**: Previene reversas duplicadas
3. **Restaurar saldo del préstamo**: Suma el monto pagado al saldo
4. **Devolver débito**: Si hubo débito de cuenta, acredita el monto
5. **Marcar como reversada**: Evita reversas futuras de la misma transacción
6. **Registrar motivo**: Auditoría completa del proceso

### Orden de Restauración

La reversa **no** restaura en orden específico. El saldo total del préstamo simplemente aumenta por el monto reversado. El Core Byte determina la distribución interna.

## Ejemplos de Uso

### Ejemplo 1: Reversa Exitosa con Débito

```bash
curl -X POST http://localhost:3508/byte/reversa-pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-REV-001",
    "numPrestamo": "PRES-0001234567",
    "autorizacionOriginal": "AUTH12345678901234",
    "motivo": "Error en aplicación de pago - monto incorrecto"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-REV-001",
  "autorizacion": "AUTH12345678901235",
  "numPrestamo": "PRES-0001234567",
  "numCuenta": "1234567890",
  "nuevoSaldo": 26400.00,
  "montoReversado": 1000.00,
  "codRespuesta": "0",
  "descRespuesta": "Reversa aplicada exitosamente"
}
```

### Ejemplo 2: Reversa de Pago en Efectivo

```bash
curl -X POST http://localhost:3508/byte/reversa-pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-REV-002",
    "numPrestamo": "PRES-0001234567",
    "autorizacionOriginal": "AUTH12345678901236",
    "motivo": "Pago aplicado a préstamo incorrecto"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-REV-002",
  "autorizacion": "AUTH12345678901237",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 26900.00,
  "montoReversado": 500.00,
  "codRespuesta": "0",
  "descRespuesta": "Reversa aplicada exitosamente"
}
```

### Ejemplo 3: Error - Transacción No Encontrada

```bash
curl -X POST http://localhost:3508/byte/reversa-pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-REV-003",
    "numPrestamo": "PRES-0001234567",
    "autorizacionOriginal": "AUTH99999999999999",
    "motivo": "Corrección"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-REV-003",
  "autorizacion": "",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 0.00,
  "montoReversado": 0.00,
  "codRespuesta": "002",
  "descRespuesta": "Transacción original no encontrada"
}
```

### Ejemplo 4: Error - Ya Reversada

```bash
curl -X POST http://localhost:3508/byte/reversa-pago-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-REV-004",
    "numPrestamo": "PRES-0001234567",
    "autorizacionOriginal": "AUTH12345678901234",
    "motivo": "Intento duplicado"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-REV-004",
  "autorizacion": "",
  "numPrestamo": "PRES-0001234567",
  "nuevoSaldo": 0.00,
  "montoReversado": 0.00,
  "codRespuesta": "004",
  "descRespuesta": "La transacción ya fue reversada"
}
```

## Modo Mock

### Comportamiento del Mock

- **Latencia simulada**: 500ms para imitar procesamiento
- **Registro de transacciones**: Mantiene histórico de pagos para validar reversas
- **Validación completa**: Existencia, pertenencia, estado de reversa
- **Restauración automática**: Saldo de préstamo y cuenta (si aplica)
- **Prevención de duplicados**: No permite reversar dos veces la misma transacción

### Limitaciones del Mock

- Solo puede reversar transacciones realizadas en la sesión actual
- No persiste el histórico entre reinicios del servicio
- La restauración es simplificada (suma directa al saldo total)

## Integración con NestJS

### Ejemplo 1: Reversa con Validación de Permisos

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class ReversasService {
  constructor(private byteService: ByteService) {}

  async reversarPagoConAutorizacion(
    usuarioId: string,
    rol: string,
    numPrestamo: string,
    autorizacionOriginal: string,
    motivo: string
  ) {
    // Solo supervisores pueden hacer reversas
    if (!['SUPERVISOR', 'GERENTE'].includes(rol)) {
      throw new ForbiddenException('No tiene permisos para realizar reversas');
    }

    // Validar motivo obligatorio
    if (!motivo || motivo.length < 10) {
      throw new BadRequestException('El motivo debe tener al menos 10 caracteres');
    }

    // Aplicar reversa
    const resultado = await this.byteService.reversaPagoPrestamo({
      idTransaccion: `REV-${usuarioId}-${Date.now()}`,
      numPrestamo,
      autorizacionOriginal,
      motivo,
    });

    if (resultado.codRespuesta !== '0') {
      throw new BadRequestException(resultado.descRespuesta);
    }

    // Registrar en auditoría
    await this.auditService.registrar({
      tipo: 'REVERSA_PAGO_PRESTAMO',
      usuarioId,
      prestamo: numPrestamo,
      autorizacionOriginal,
      autorizacionReversa: resultado.autorizacion,
      montoReversado: resultado.montoReversado,
      motivo,
      timestamp: new Date(),
    });

    // Notificar a supervisores
    await this.notificacionService.enviarEmail('supervisores@cooperativa.com', {
      tipo: 'REVERSA_REALIZADA',
      usuario: usuarioId,
      prestamo: numPrestamo,
      monto: resultado.montoReversado,
      motivo,
    });

    return resultado;
  }
}
```

### Ejemplo 2: Workflow de Aprobación para Reversas

```typescript
async solicitarReversa(
  usuarioId: string,
  numPrestamo: string,
  autorizacionOriginal: string,
  motivo: string
) {
  // Crear solicitud de reversa
  const solicitud = await this.db.solicitudesReversa.create({
    usuarioSolicita: usuarioId,
    numPrestamo,
    autorizacionOriginal,
    motivo,
    estado: 'PENDIENTE',
    fechaSolicitud: new Date(),
  });

  // Notificar a supervisor
  await this.notificacionService.notificarSupervisor({
    tipo: 'SOLICITUD_REVERSA',
    solicitudId: solicitud.id,
    usuario: usuarioId,
    prestamo: numPrestamo,
    monto: await this.obtenerMontoPago(autorizacionOriginal),
  });

  return {
    solicitudId: solicitud.id,
    mensaje: 'Solicitud de reversa enviada para aprobación',
  };
}

async aprobarReversa(supervisorId: string, solicitudId: number) {
  const solicitud = await this.db.solicitudesReversa.findOne(solicitudId);

  if (!solicitud) {
    throw new NotFoundException('Solicitud no encontrada');
  }

  if (solicitud.estado !== 'PENDIENTE') {
    throw new BadRequestException('La solicitud ya fue procesada');
  }

  // Aplicar reversa
  try {
    const resultado = await this.byteService.reversaPagoPrestamo({
      idTransaccion: `APROV-${solicitudId}-${Date.now()}`,
      numPrestamo: solicitud.numPrestamo,
      autorizacionOriginal: solicitud.autorizacionOriginal,
      motivo: `${solicitud.motivo} - Aprobado por: ${supervisorId}`,
    });

    // Actualizar solicitud
    await this.db.solicitudesReversa.update(solicitudId, {
      estado: 'APROBADA',
      supervisorAprueba: supervisorId,
      autorizacionReversa: resultado.autorizacion,
      fechaAprobacion: new Date(),
    });

    // Notificar al solicitante
    await this.notificacionService.enviarEmail(solicitud.usuarioSolicita, {
      tipo: 'REVERSA_APROBADA',
      solicitudId,
      autorizacion: resultado.autorizacion,
    });

    return resultado;
  } catch (error) {
    await this.db.solicitudesReversa.update(solicitudId, {
      estado: 'RECHAZADA',
      observaciones: error.message,
    });
    throw error;
  }
}
```

### Ejemplo 3: Reversa Automática por Timeout

```typescript
@Cron(CronExpression.EVERY_HOUR)
async verificarPagosErroneos() {
  // Buscar pagos recientes que puedan necesitar reversa
  const pagosRecientes = await this.db.pagos.findMany({
    where: {
      fecha: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
      },
      marcadoParaReversa: true,
      reversado: false,
    },
  });

  for (const pago of pagosRecientes) {
    try {
      this.logger.log(`Procesando reversa automática para pago ${pago.autorizacion}`);

      const resultado = await this.byteService.reversaPagoPrestamo({
        idTransaccion: `AUTO-REV-${pago.id}-${Date.now()}`,
        numPrestamo: pago.numPrestamo,
        autorizacionOriginal: pago.autorizacion,
        motivo: `Reversa automática: ${pago.motivoReversa}`,
      });

      if (resultado.codRespuesta === '0') {
        await this.db.pagos.update(pago.id, {
          reversado: true,
          autorizacionReversa: resultado.autorizacion,
          fechaReversa: new Date(),
        });

        this.logger.log(`Reversa automática exitosa: ${resultado.autorizacion}`);
      }
    } catch (error) {
      this.logger.error(`Error en reversa automática: ${error.message}`);
    }
  }
}
```

### Ejemplo 4: Dashboard de Reversas

```typescript
async obtenerEstadisticasReversas(fechaInicio: Date, fechaFin: Date) {
  const reversas = await this.db.reversas.findMany({
    where: {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    },
    include: {
      usuario: true,
      pagoOriginal: true,
    },
  });

  return {
    total: reversas.length,
    montoTotal: reversas.reduce((sum, r) => sum + r.montoReversado, 0),
    porMotivo: this.agruparPorMotivo(reversas),
    porUsuario: this.agruparPorUsuario(reversas),
    distribuciones: {
      conDebito: reversas.filter(r => r.numCuenta).length,
      soloEfectivo: reversas.filter(r => !r.numCuenta).length,
    },
    tiempoPromedio: this.calcularTiempoPromedio(reversas),
  };
}

private agruparPorMotivo(reversas: any[]) {
  const grupos = {};
  reversas.forEach(r => {
    const categoria = this.categorizarMotivo(r.motivo);
    grupos[categoria] = (grupos[categoria] || 0) + 1;
  });
  return grupos;
}

private categorizarMotivo(motivo: string): string {
  if (motivo.includes('error')) return 'ERROR_APLICACION';
  if (motivo.includes('duplicado')) return 'PAGO_DUPLICADO';
  if (motivo.includes('monto')) return 'MONTO_INCORRECTO';
  if (motivo.includes('préstamo incorrecto')) return 'PRESTAMO_INCORRECTO';
  return 'OTROS';
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "reversaPagoPrestamo_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-REV-001"
    },
    "detalle": {
      "numPrestamo": "PRES-0001234567",
      "autorizacionOriginal": "AUTH12345678901234",
      "motivo": "Error en aplicación de pago"
    }
  }
}
```

### Response del Core

```json
{
  "reversaPagoPrestamo_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-REV-001"
    },
    "detalle": {
      "autorizacion": "AUTH12345678901235",
      "numPrestamo": "PRES-0001234567",
      "numCuenta": "1234567890",
      "nuevoSaldo": "26400.00",
      "montoReversado": "1000.00",
      "codRespuesta": "0",
      "descRespuesta": "Reversa aplicada exitosamente"
    }
  }
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - reversaPagoPrestamo', () => {
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

  it('debe reversar pago con débito exitosamente', async () => {
    // Primero hacer un pago
    const pago = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-001',
      numPrestamo: 'PRES-0001234567',
      numCuenta: '1234567890',
      montoDebito: 1000,
      montoTotal: 1000,
    });

    expect(pago.codRespuesta).toBe('0');
    const saldoDespuesPago = service.getSaldo('1234567890');
    expect(saldoDespuesPago).toBe(4000); // 5000 - 1000

    // Ahora reversar
    const reversa = await service.reversaPagoPrestamo({
      idTransaccion: 'TEST-REV-001',
      numPrestamo: 'PRES-0001234567',
      autorizacionOriginal: pago.autorizacion,
      motivo: 'Test reversa',
    });

    expect(reversa.codRespuesta).toBe('0');
    expect(reversa.montoReversado).toBe(1000);
    expect(reversa.nuevoSaldo).toBe(26400); // Saldo restaurado

    // Verificar que el débito se devolvió
    const saldoDespuesReversa = service.getSaldo('1234567890');
    expect(saldoDespuesReversa).toBe(5000); // Restaurado
  });

  it('debe rechazar reversa de transacción no encontrada', async () => {
    const reversa = await service.reversaPagoPrestamo({
      idTransaccion: 'TEST-REV-002',
      numPrestamo: 'PRES-0001234567',
      autorizacionOriginal: 'AUTH99999999999999',
      motivo: 'Test',
    });

    expect(reversa.codRespuesta).toBe('002');
    expect(reversa.descRespuesta).toBe('Transacción original no encontrada');
  });

  it('debe rechazar reversa duplicada', async () => {
    // Hacer pago
    const pago = await service.pagoPrestamo({
      idTransaccion: 'TEST-PAGO-002',
      numPrestamo: 'PRES-0001234567',
      montoEfectivo: 500,
      montoTotal: 500,
    });

    // Primera reversa
    await service.reversaPagoPrestamo({
      idTransaccion: 'TEST-REV-003',
      numPrestamo: 'PRES-0001234567',
      autorizacionOriginal: pago.autorizacion,
      motivo: 'Primera reversa',
    });

    // Intentar reversar de nuevo
    const segundaReversa = await service.reversaPagoPrestamo({
      idTransaccion: 'TEST-REV-004',
      numPrestamo: 'PRES-0001234567',
      autorizacionOriginal: pago.autorizacion,
      motivo: 'Intento duplicado',
    });

    expect(segundaReversa.codRespuesta).toBe('004');
    expect(segundaReversa.descRespuesta).toBe('La transacción ya fue reversada');
  });
});
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numPrestamo`: No puede estar vacío
- `autorizacionOriginal`: No puede estar vacío
- `motivo`: No puede estar vacío (requerido para auditoría)

### Validaciones de Negocio

- Préstamo debe existir
- Transacción original debe existir
- Transacción debe pertenecer al préstamo especificado
- Transacción no debe haber sido reversada previamente
- Solo personal autorizado puede realizar reversas

## Logs

### Mock Mode

```
[ByteMockService] Mock: Procesando reversa de pago para préstamo PRES-0001234567
[ByteMockService] Mock: Reversa exitosa - Préstamo: PRES-0001234567, Monto Reversado: 1000, Nuevo Saldo: 26400, Autorización Original: AUTH12345678901234, Autorización Reversa: AUTH12345678901235, Motivo: Error en aplicación de pago
```

### Real Mode

```
[ByteService] Enviando reversa de pago a Byte - Préstamo: PRES-0001234567, Autorización Original: AUTH12345678901234
[ByteService] Respuesta Byte - Autorización Reversa: AUTH123456789, Código: 0, Monto Reversado: 1000
```

## Consideraciones de Seguridad

### Control de Acceso Estricto

```typescript
@Roles('SUPERVISOR', 'GERENTE')
@UseGuards(JwtAuthGuard, RolesGuard)
async reversarPago(@Body() request: ReversaPagoPrestamoRequestDto) {
  return this.byteService.reversaPagoPrestamo(request);
}
```

### Auditoría Obligatoria

- **Motivo detallado**: Siempre requerido
- **Usuario autorizado**: Registrar quién realiza la reversa
- **Trazabilidad completa**: Enlazar pago original con reversa
- **Alertas automáticas**: Notificar reversas a supervisión

### Límites y Controles

```typescript
const limites = {
  tiempoMaximoReversa: 24 * 60 * 60 * 1000, // 24 horas
  montoMaximoSinAprobacion: 5000,
  reversasPorDia: 10,
};

// Validar que no haya pasado el tiempo límite
if (Date.now() - pagoOriginal.timestamp > limites.tiempoMaximoReversa) {
  throw new BadRequestException('El pago es muy antiguo para reversar');
}

// Validar monto si requiere aprobación adicional
if (pagoOriginal.monto > limites.montoMaximoSinAprobacion) {
  await this.validarAprobacionGerencia();
}
```

## Troubleshooting

### No Se Encuentra la Transacción Original

**Causa**: Transacción no registrada o autorización incorrecta.

**Solución**:
- Verificar número de autorización exacto
- Consultar histórico de pagos del préstamo
- Validar que el pago se haya aplicado correctamente

### Reversa Aplicada Pero Saldo No Cambia

**Causa**: Sincronización pendiente con el Core.

**Solución**:
- Esperar unos minutos y re-consultar
- Verificar autorización de reversa en logs
- Consultar directamente al Core Byte

### Cuenta No Recibe Devolución de Débito

**Causa**: Problema en restauración de débito.

**Solución**:
- Verificar `numCuenta` en response de reversa
- Consultar saldo de cuenta directamente
- Abrir ticket con soporte del Core si persiste

### Error al Reversar Pago Antiguo

**Causa**: Límite de tiempo excedido.

**Solución**:
- Validar políticas de reversa de la cooperativa
- Solicitar aprobación especial de gerencia
- Considerar ajuste contable manual si es muy antiguo

---

**Versión**: 1.0  
**Componente Byte**: #008  
**Última actualización**: Noviembre 2025
