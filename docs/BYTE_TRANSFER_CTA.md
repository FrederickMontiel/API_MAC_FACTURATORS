# Módulo Byte - Transferencia entre Cuentas

## Descripción

El componente de transferencias permite mover fondos entre cuentas dentro de la misma institución, ya sean cuentas propias o de terceros. Este módulo implementa el **Componente #005** de la especificación Byte.

## API Endpoint

### POST /byte/transfer-cta

Realiza una transferencia de fondos desde una cuenta origen hacia una cuenta destino.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-001237",
  "numCuentaOrigen": "1234567890",
  "numCuentaDestino": "0987654321",
  "montoTransferencia": 1000.00
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numCuentaOrigen` | string | Sí | Número de cuenta desde donde se debita |
| `numCuentaDestino` | string | Sí | Número de cuenta donde se acredita |
| `montoTransferencia` | number | Sí | Monto a transferir (debe ser > 0) |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-001237",
  "autorizacion": "AUTH17329012345681",
  "codRespuesta": "0",
  "descRespuesta": "Transferencia exitosa"
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción (mismo del request) |
| `autorizacion` | string | Número de autorización generado por el Core |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Transferencia exitosa |
| `001` | Cuenta origen no existe |
| `002` | Cuenta destino no existe |
| `003` | Saldo insuficiente en cuenta origen |
| `004` | No se puede transferir a la misma cuenta |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Ejemplos de Uso

### Ejemplo 1: Transferencia Exitosa

```bash
curl -X POST http://localhost:3508/byte/transfer-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-TRANS-001",
    "numCuentaOrigen": "1234567890",
    "numCuentaDestino": "0987654321",
    "montoTransferencia": 1000.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-TRANS-001",
  "autorizacion": "AUTH17329012345681",
  "codRespuesta": "0",
  "descRespuesta": "Transferencia exitosa"
}
```

### Ejemplo 2: Saldo Insuficiente

```bash
curl -X POST http://localhost:3508/byte/transfer-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-TRANS-002",
    "numCuentaOrigen": "2222222222",
    "numCuentaDestino": "1234567890",
    "montoTransferencia": 500.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-TRANS-002",
  "autorizacion": "",
  "codRespuesta": "003",
  "descRespuesta": "Saldo insuficiente en cuenta origen"
}
```

### Ejemplo 3: Cuenta Destino No Existe

```bash
curl -X POST http://localhost:3508/byte/transfer-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-TRANS-003",
    "numCuentaOrigen": "1234567890",
    "numCuentaDestino": "9999999999",
    "montoTransferencia": 500.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-TRANS-003",
  "autorizacion": "",
  "codRespuesta": "002",
  "descRespuesta": "Cuenta destino no existe"
}
```

## Modo Mock

### Validaciones del Mock

El servicio mock realiza las siguientes validaciones:

1. **Cuenta Origen Existe**: Verifica que la cuenta origen esté en las cuentas simuladas
2. **Cuenta Destino Existe**: Verifica que la cuenta destino esté en las cuentas simuladas
3. **Cuentas Diferentes**: No permite transferir a la misma cuenta
4. **Saldo Suficiente**: Valida que el saldo origen sea mayor o igual al monto
5. **Actualización Atómica**: Debita de origen y acredita en destino simultáneamente

### Comportamiento del Mock

- **Latencia simulada**: 600ms para imitar procesamiento de transferencia
- **Actualización en memoria**: Los saldos se actualizan inmediatamente en ambas cuentas
- **Transacción atómica**: Si falla alguna validación, no se modifica ningún saldo

## Integración con NestJS

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class TransferenciasService {
  constructor(private byteService: ByteService) {}

  async transferirEntreClientes(
    cuentaOrigen: string,
    cuentaDestino: string,
    monto: number
  ) {
    // Validar monto mínimo
    if (monto < 1) {
      throw new BadRequestException('Monto mínimo de transferencia: Q1.00');
    }

    // Verificar saldo antes de transferir
    const consulta = await this.byteService.consultaCta({
      idTransaccion: `CHK-${Date.now()}`,
      numCuenta: cuentaOrigen,
    });

    if (consulta.saldoDisponible < monto) {
      throw new BadRequestException(
        `Saldo insuficiente. Disponible: Q${consulta.saldoDisponible}`
      );
    }

    // Realizar transferencia
    const resultado = await this.byteService.transferCta({
      idTransaccion: `TRANS-${Date.now()}`,
      numCuentaOrigen: cuentaOrigen,
      numCuentaDestino: cuentaDestino,
      montoTransferencia: monto,
    });

    if (resultado.codRespuesta !== '0') {
      throw new BadRequestException(resultado.descRespuesta);
    }

    return {
      autorizacion: resultado.autorizacion,
      mensaje: 'Transferencia realizada exitosamente',
    };
  }

  async transferirACuentaPropia(clienteId: string, cuentaOrigen: string, cuentaDestino: string, monto: number) {
    // Verificar que ambas cuentas pertenecen al cliente
    const cuentasCliente = await this.obtenerCuentasCliente(clienteId);
    
    if (!cuentasCliente.includes(cuentaOrigen) || !cuentasCliente.includes(cuentaDestino)) {
      throw new BadRequestException('Una o ambas cuentas no pertenecen al cliente');
    }

    return this.transferirEntreClientes(cuentaOrigen, cuentaDestino, monto);
  }
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "transferCta_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001237"
    },
    "detalle": {
      "numCuentaOrigen": "1234567890",
      "numCuentaDestino": "0987654321",
      "montoTransferencia": "1000.00"
    }
  }
}
```

### Response del Core

```json
{
  "consultaCta_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001237"
    },
    "detalle": {
      "autorizacion": "AUTH123456789",
      "codRespuesta": "0",
      "descRespuesta": "Transferencia exitosa"
    }
  }
}
```

## Casos de Uso

### 1. Transferencia entre Cuentas Propias

```typescript
async moverFondosEntreCuentas(clienteId: string, origen: string, destino: string, monto: number) {
  // Validar propiedad de cuentas
  const cuentas = await this.clienteService.obtenerCuentas(clienteId);
  
  if (!cuentas.includes(origen) || !cuentas.includes(destino)) {
    throw new ForbiddenException('No tiene acceso a una o ambas cuentas');
  }

  const resultado = await this.byteService.transferCta({
    idTransaccion: `PROP-${clienteId}-${Date.now()}`,
    numCuentaOrigen: origen,
    numCuentaDestino: destino,
    montoTransferencia: monto,
  });

  // Registrar en auditoría
  await this.auditService.registrar({
    tipo: 'TRANSFERENCIA_PROPIA',
    cliente: clienteId,
    autorizacion: resultado.autorizacion,
    monto,
  });

  return resultado;
}
```

### 2. Transferencia a Terceros

```typescript
async transferirATercero(
  clienteId: string,
  cuentaOrigen: string,
  cuentaDestinoTercero: string,
  monto: number,
  referencia?: string
) {
  // Validar límites diarios
  const totalHoy = await this.obtenerTransferenciasDelDia(clienteId);
  const limiteDialio = 10000;

  if (totalHoy + monto > limiteDialio) {
    throw new BadRequestException('Excede límite diario de transferencias');
  }

  // Validar cuenta origen pertenece al cliente
  const cuentas = await this.clienteService.obtenerCuentas(clienteId);
  if (!cuentas.includes(cuentaOrigen)) {
    throw new ForbiddenException('Cuenta origen no pertenece al cliente');
  }

  const resultado = await this.byteService.transferCta({
    idTransaccion: `TERC-${clienteId}-${Date.now()}`,
    numCuentaOrigen: cuentaOrigen,
    numCuentaDestino: cuentaDestinoTercero,
    montoTransferencia: monto,
  });

  // Notificar al cliente
  await this.notificacionService.enviarEmail(clienteId, {
    tipo: 'TRANSFERENCIA_REALIZADA',
    monto,
    destino: cuentaDestinoTercero,
    autorizacion: resultado.autorizacion,
  });

  return resultado;
}
```

### 3. Transferencia Programada

```typescript
async programarTransferencia(
  clienteId: string,
  origen: string,
  destino: string,
  monto: number,
  fechaEjecucion: Date
) {
  // Guardar transferencia programada
  const programada = await this.db.transferenciasProgramadas.create({
    clienteId,
    cuentaOrigen: origen,
    cuentaDestino: destino,
    monto,
    fechaEjecucion,
    estado: 'PENDIENTE',
  });

  // Agendar job
  await this.scheduleService.scheduleJob(fechaEjecucion, async () => {
    try {
      const resultado = await this.byteService.transferCta({
        idTransaccion: `PROG-${programada.id}-${Date.now()}`,
        numCuentaOrigen: origen,
        numCuentaDestino: destino,
        montoTransferencia: monto,
      });

      await this.db.transferenciasProgramadas.update(programada.id, {
        estado: 'EJECUTADA',
        autorizacion: resultado.autorizacion,
      });
    } catch (error) {
      await this.db.transferenciasProgramadas.update(programada.id, {
        estado: 'FALLIDA',
        error: error.message,
      });
    }
  });

  return programada;
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - transferCta', () => {
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
    service.resetCuentas(); // Resetear saldos antes de cada test
  });

  it('debe transferir exitosamente entre cuentas', async () => {
    const resultado = await service.transferCta({
      idTransaccion: 'TEST-TRANS-001',
      numCuentaOrigen: '1234567890', // Saldo inicial: 5000
      numCuentaDestino: '0987654321', // Saldo inicial: 10000
      montoTransferencia: 1000,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.autorizacion).toBeTruthy();

    // Verificar saldos actualizados
    const saldoOrigen = service.getSaldo('1234567890');
    const saldoDestino = service.getSaldo('0987654321');
    expect(saldoOrigen).toBe(4000); // 5000 - 1000
    expect(saldoDestino).toBe(11000); // 10000 + 1000
  });

  it('debe rechazar por saldo insuficiente', async () => {
    const resultado = await service.transferCta({
      idTransaccion: 'TEST-TRANS-002',
      numCuentaOrigen: '1111111111', // Saldo: 500
      numCuentaDestino: '1234567890',
      montoTransferencia: 1000,
    });

    expect(resultado.codRespuesta).toBe('003');
    expect(resultado.descRespuesta).toBe('Saldo insuficiente en cuenta origen');
  });

  it('debe rechazar transferencia a misma cuenta', async () => {
    const resultado = await service.transferCta({
      idTransaccion: 'TEST-TRANS-003',
      numCuentaOrigen: '1234567890',
      numCuentaDestino: '1234567890',
      montoTransferencia: 100,
    });

    expect(resultado.codRespuesta).toBe('004');
    expect(resultado.descRespuesta).toBe('No se puede transferir a la misma cuenta');
  });

  it('debe rechazar si cuenta origen no existe', async () => {
    const resultado = await service.transferCta({
      idTransaccion: 'TEST-TRANS-004',
      numCuentaOrigen: '9999999999',
      numCuentaDestino: '1234567890',
      montoTransferencia: 100,
    });

    expect(resultado.codRespuesta).toBe('001');
    expect(resultado.descRespuesta).toBe('Cuenta origen no existe');
  });

  it('debe rechazar si cuenta destino no existe', async () => {
    const resultado = await service.transferCta({
      idTransaccion: 'TEST-TRANS-005',
      numCuentaOrigen: '1234567890',
      numCuentaDestino: '9999999999',
      montoTransferencia: 100,
    });

    expect(resultado.codRespuesta).toBe('002');
    expect(resultado.descRespuesta).toBe('Cuenta destino no existe');
  });
});
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numCuentaOrigen`: No puede estar vacío
- `numCuentaDestino`: No puede estar vacío
- `montoTransferencia`: Debe ser mayor a 0

### Validaciones de Negocio

- Ambas cuentas deben existir
- Las cuentas deben ser diferentes
- Ambas cuentas deben estar activas
- Ambas cuentas deben ser de ahorro (validado por el Core)
- El saldo debe ser suficiente en la cuenta origen

## Logs

### Mock Mode

```
[ByteMockService] Mock: Procesando transferencia de 1234567890 a 0987654321 por 1000
[ByteMockService] Mock: Transferencia exitosa - Origen: 1234567890 (4000), Destino: 0987654321 (11000), Monto: 1000, Autorización: AUTH17329012345681
```

### Real Mode

```
[ByteService] Enviando transferencia a Byte - Origen: 1234567890, Destino: 0987654321, Monto: 1000
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Código: 0
```

## Consideraciones de Seguridad

### Autenticación y Autorización

- ✅ JWT requerido para todas las transferencias
- ✅ Validar propiedad de cuenta origen
- ✅ Verificar límites de transferencia según perfil
- ✅ Logging completo de todas las operaciones

### Límites y Controles

```typescript
const limites = {
  transferenciaPropias: {
    minimo: 1,
    maximo: 999999,
    diario: Infinity, // Sin límite
  },
  transferenciasTerceros: {
    minimo: 1,
    maximo: 50000, // Por transacción
    diario: 100000, // Por día
  },
};
```

### Auditoría

```typescript
await this.auditService.registrar({
  tipo: 'TRANSFERENCIA',
  clienteId,
  cuentaOrigen,
  cuentaDestino,
  monto,
  autorizacion,
  ip: request.ip,
  timestamp: new Date(),
});
```

## Troubleshooting

### Error: Saldo Insuficiente

**Causa**: La cuenta origen no tiene fondos suficientes.

**Solución**:
- Consultar saldo antes de transferir
- Considerar saldo disponible (no total)
- Verificar que no haya bloqueos o reservas

### Error: Cuentas Iguales

**Causa**: Se intenta transferir de una cuenta a sí misma.

**Solución**:
- Validar cuentas diferentes en el frontend
- Usar consulta de saldo para mover entre productos

### Transferencia No Se Refleja

**Causa**: La transacción puede estar en proceso.

**Solución**:
- Verificar autorización en logs
- Consultar ambas cuentas para confirmar saldos
- Revisar estado de transacción en Core

### Timeout

**Causa**: El Core tarda más de 30 segundos.

**Solución**:
- Verificar conectividad
- Revisar carga del Core Byte
- Considerar aumentar timeout para transferencias

## Diferencias: Transferencias vs Otros Componentes

| Aspecto | Transferencia | Depósito/Retiro | Consulta |
|---------|---------------|-----------------|----------|
| Cuentas | 2 cuentas | 1 cuenta | 1 cuenta |
| Validación | Origen y destino | Una cuenta | Existencia |
| Impacto | Débito + Crédito | Solo débito o crédito | Sin cambios |
| Atomicidad | Crítica | Importante | No aplica |

---

**Versión**: 1.0  
**Componente Byte**: #005  
**Última actualización**: Noviembre 2025
