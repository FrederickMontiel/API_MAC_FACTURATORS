# Módulo Byte - Consulta de Saldos de Cuenta

## Descripción

El componente de consulta de saldos permite obtener información detallada sobre el estado y saldos de una cuenta de ahorro o plazo fijo. Este módulo implementa el **Componente #004** de la especificación Byte.

## API Endpoint

### POST /byte/consulta-cta

Consulta el estado, fecha de último movimiento, saldo total, disponible, reservas y bloqueos de una cuenta.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-001236",
  "numCuenta": "1234567890"
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numCuenta` | string | Sí | Número de cuenta a consultar |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-001236",
  "autorizacion": "AUTH17329012345680",
  "estadoCuenta": "ACTIVA",
  "fechaUltMov": "2025-11-24",
  "saldoTotal": 5000.00,
  "saldoDisponible": 4250.00,
  "saldoReservas": 500.00,
  "saldoBloqueos": 250.00,
  "codRespuesta": "0",
  "descRespuesta": "Consulta exitosa"
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción (mismo del request) |
| `autorizacion` | string | Número de autorización generado por el Core |
| `estadoCuenta` | string | Estado actual de la cuenta (ACTIVA, BLOQUEADA, etc.) |
| `fechaUltMov` | string | Fecha del último movimiento (formato: YYYY-MM-DD) |
| `saldoTotal` | number | Saldo total = disponible + reservas - bloqueos |
| `saldoDisponible` | number | Saldo disponible para retiros y transferencias |
| `saldoReservas` | number | Saldo en reservas |
| `saldoBloqueos` | number | Saldo bloqueado |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Consulta exitosa |
| `001` | Cuenta no existe |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Ejemplos de Uso

### Ejemplo 1: Consulta Exitosa

```bash
curl -X POST http://localhost:3508/byte/consulta-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-CONS-001",
    "numCuenta": "1234567890"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-CONS-001",
  "autorizacion": "AUTH17329012345680",
  "estadoCuenta": "ACTIVA",
  "fechaUltMov": "2025-11-24",
  "saldoTotal": 5000.00,
  "saldoDisponible": 4250.00,
  "saldoReservas": 500.00,
  "saldoBloqueos": 250.00,
  "codRespuesta": "0",
  "descRespuesta": "Consulta exitosa"
}
```

### Ejemplo 2: Cuenta No Existe

```bash
curl -X POST http://localhost:3508/byte/consulta-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-CONS-002",
    "numCuenta": "9999999999"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-CONS-002",
  "autorizacion": "",
  "estadoCuenta": "",
  "fechaUltMov": "",
  "saldoTotal": 0,
  "saldoDisponible": 0,
  "saldoReservas": 0,
  "saldoBloqueos": 0,
  "codRespuesta": "001",
  "descRespuesta": "Cuenta no existe"
}
```

## Modo Mock

### Simulación de Saldos

El mock calcula automáticamente los diferentes tipos de saldo:

- **Saldo Total**: Saldo actual almacenado en memoria
- **Reservas**: 10% del saldo total
- **Bloqueos**: 5% del saldo total
- **Disponible**: Total - Reservas - Bloqueos

### Características del Mock

1. **Validación**
   - Verifica que la cuenta existe en las cuentas simuladas

2. **Datos Generados**
   - Estado: Siempre "ACTIVA"
   - Fecha último movimiento: Fecha actual
   - Autorización única por consulta

3. **Latencia**
   - Delay de 300ms para simular consulta en red

## Integración con NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class CuentasService {
  constructor(private byteService: ByteService) {}

  async obtenerSaldoCuenta(numCuenta: string) {
    const resultado = await this.byteService.consultaCta({
      idTransaccion: 'CONS-' + Date.now(),
      numCuenta,
    });

    if (resultado.codRespuesta !== '0') {
      throw new Error(resultado.descRespuesta);
    }

    return {
      disponible: resultado.saldoDisponible,
      total: resultado.saldoTotal,
      estado: resultado.estadoCuenta,
      ultimoMovimiento: resultado.fechaUltMov,
    };
  }

  async verificarSaldoDisponible(numCuenta: string, montoRequerido: number): Promise<boolean> {
    const resultado = await this.byteService.consultaCta({
      idTransaccion: 'VER-' + Date.now(),
      numCuenta,
    });

    return resultado.saldoDisponible >= montoRequerido;
  }
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "consultaCta_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001236"
    },
    "detalle": {
      "numCuenta": "1234567890"
    }
  }
}
```

### Response del Core

```json
{
  "consultaCta_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001236"
    },
    "detalle": {
      "autorizacion": "AUTH123456789",
      "estadoCuenta": "ACTIVA",
      "fechaUltMov": "2025-11-24",
      "saldoTotal": "5000.00",
      "saldoDisponible": "4250.00",
      "saldoReservas": "500.00",
      "saldoBloqueos": "250.00",
      "codRespuesta": "0",
      "descRespuesta": "Consulta exitosa"
    }
  }
}
```

## Casos de Uso

### 1. Verificar Saldo Antes de Transacción

```typescript
async procesarPago(numCuenta: string, monto: number) {
  // Consultar saldo disponible
  const consulta = await this.byteService.consultaCta({
    idTransaccion: `CHK-${Date.now()}`,
    numCuenta,
  });

  if (consulta.saldoDisponible < monto) {
    throw new BadRequestException('Saldo insuficiente');
  }

  // Proceder con el pago
  // ...
}
```

### 2. Mostrar Información de Cuenta en UI

```typescript
async obtenerDatosCuenta(numCuenta: string) {
  const consulta = await this.byteService.consultaCta({
    idTransaccion: `UI-${Date.now()}`,
    numCuenta,
  });

  return {
    estado: consulta.estadoCuenta,
    saldos: {
      disponible: this.formatearMoneda(consulta.saldoDisponible),
      total: this.formatearMoneda(consulta.saldoTotal),
      reservado: this.formatearMoneda(consulta.saldoReservas),
      bloqueado: this.formatearMoneda(consulta.saldoBloqueos),
    },
    ultimaActividad: this.formatearFecha(consulta.fechaUltMov),
  };
}
```

### 3. Validación Pre-Retiro

```typescript
async validarRetiro(numCuenta: string, montoRetiro: number) {
  const consulta = await this.byteService.consultaCta({
    idTransaccion: `VAL-RET-${Date.now()}`,
    numCuenta,
  });

  const errores = [];

  if (consulta.estadoCuenta !== 'ACTIVA') {
    errores.push('Cuenta no está activa');
  }

  if (consulta.saldoDisponible < montoRetiro) {
    errores.push(`Saldo insuficiente. Disponible: Q${consulta.saldoDisponible}`);
  }

  if (errores.length > 0) {
    throw new BadRequestException(errores.join('. '));
  }

  return true;
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - consultaCta', () => {
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
  });

  it('debe retornar saldos correctamente', async () => {
    const resultado = await service.consultaCta({
      idTransaccion: 'TEST-CONS-001',
      numCuenta: '1234567890',
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.saldoTotal).toBe(5000);
    expect(resultado.saldoDisponible).toBeLessThan(resultado.saldoTotal);
    expect(resultado.estadoCuenta).toBe('ACTIVA');
    expect(resultado.autorizacion).toBeTruthy();
  });

  it('debe calcular saldos correctamente', async () => {
    const resultado = await service.consultaCta({
      idTransaccion: 'TEST-CONS-002',
      numCuenta: '1234567890',
    });

    const calculado = resultado.saldoDisponible + resultado.saldoReservas + resultado.saldoBloqueos;
    expect(Math.abs(calculado - resultado.saldoTotal)).toBeLessThan(0.1);
  });

  it('debe rechazar cuenta inexistente', async () => {
    const resultado = await service.consultaCta({
      idTransaccion: 'TEST-CONS-003',
      numCuenta: '9999999999',
    });

    expect(resultado.codRespuesta).toBe('001');
    expect(resultado.descRespuesta).toBe('Cuenta no existe');
    expect(resultado.saldoTotal).toBe(0);
  });
});
```

## Tipos de Saldo

### Saldo Total
Saldo completo de la cuenta incluyendo todas las reservas y bloqueos.

**Fórmula:** `Disponible + Reservas + Bloqueos`

### Saldo Disponible
Saldo que puede ser utilizado para retiros, transferencias y pagos inmediatos.

**Fórmula:** `Total - Reservas - Bloqueos`

### Saldo en Reservas
Monto reservado para transacciones pendientes o futuras (ej: cheques no cobrados, autorizaciones pendientes).

### Saldo Bloqueado
Monto bloqueado por razones legales, embargos o restricciones de la cuenta.

## Estados de Cuenta

| Estado | Descripción |
|--------|-------------|
| `ACTIVA` | Cuenta operativa, puede realizar transacciones |
| `BLOQUEADA` | Cuenta temporalmente bloqueada |
| `INACTIVA` | Cuenta sin movimientos por tiempo prolongado |
| `CERRADA` | Cuenta cerrada definitivamente |
| `RESTRINGIDA` | Cuenta con restricciones específicas |

## Logs

### Mock Mode

```
[ByteMockService] Mock: Consultando saldos para cuenta 1234567890
[ByteMockService] Mock: Consulta exitosa - Cuenta: 1234567890, Saldo total: 5000, Disponible: 4250, Autorización: AUTH17329012345680
```

### Real Mode

```
[ByteService] Consultando saldos en Byte - Cuenta: 1234567890
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Saldo disponible: 4250.00
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numCuenta`: No puede estar vacío

### Validaciones de Negocio

- La cuenta debe existir en el sistema
- El servicio debe retornar información actualizada

## Troubleshooting

### Error: Cuenta No Existe

**Causa**: El número de cuenta no está registrado.

**Solución**:
- Verificar que el número de cuenta sea correcto
- En mock, usar cuentas predefinidas: `1234567890`, `0987654321`, `1111111111`, `2222222222`

### Saldos Inconsistentes

**Causa**: En modo mock, los saldos se calculan automáticamente como porcentajes.

**Solución**:
- Verificar que `disponible + reservas + bloqueos ≈ total`
- En modo real, los valores vienen directamente del Core

### Timeout de Servicio

**Causa**: El Core Byte no responde en 30 segundos.

**Solución**:
- Verificar conectividad con el Core
- Revisar logs del Core Byte
- Verificar URL_BYTE en configuración

## Seguridad

- ✅ Autenticación JWT requerida
- ✅ No modifica datos, solo consulta
- ✅ Logging de todas las consultas
- ✅ Timeout de 30 segundos
- ✅ Autorización única por consulta

## Diferencias con Otros Componentes

| Aspecto | Consulta | Depósito/Retiro |
|---------|----------|-----------------|
| Operación | Solo lectura | Modifica saldo |
| Validación | Cuenta existe | Saldo suficiente |
| Autorización | Informativa | Transaccional |
| Uso común | Verificación previa | Operación final |

---

**Versión**: 1.0  
**Componente Byte**: #004  
**Última actualización**: Noviembre 2025
