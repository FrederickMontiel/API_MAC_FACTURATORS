# Módulo Byte - Consulta de Saldo de Préstamo

## Descripción

El componente de consulta de préstamos permite obtener información detallada sobre los saldos pendientes de un préstamo, incluyendo capital, intereses, mora y el próximo pago programado. Este módulo implementa el **Componente #006** de la especificación Byte.

## API Endpoint

### POST /byte/consulta-prestamo

Consulta los saldos y estado actual de un préstamo.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-PRE-001",
  "numPrestamo": "PRES-0001234567"
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numPrestamo` | string | Sí | Número de préstamo a consultar |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-PRE-001",
  "autorizacion": "AUTH12345678901234",
  "numPrestamo": "PRES-0001234567",
  "saldoCapital": 25000.00,
  "saldoInteres": 1250.00,
  "saldoMora": 150.00,
  "saldoTotal": 26400.00,
  "proximoPago": 1500.00,
  "fechaProximoPago": "15/12/2025",
  "codRespuesta": "0",
  "descRespuesta": "Consulta exitosa"
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción (mismo del request) |
| `autorizacion` | string | Número de autorización generado por el Core |
| `numPrestamo` | string | Número de préstamo consultado |
| `saldoCapital` | number | Saldo pendiente del capital prestado |
| `saldoInteres` | number | Intereses acumulados pendientes de pago |
| `saldoMora` | number | Monto de mora por pagos atrasados |
| `saldoTotal` | number | Suma total: capital + interés + mora |
| `proximoPago` | number | Monto del próximo pago programado |
| `fechaProximoPago` | string | Fecha del próximo pago (DD/MM/YYYY) |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Consulta exitosa |
| `001` | Préstamo no existe |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Ejemplos de Uso

### Ejemplo 1: Consulta Exitosa

```bash
curl -X POST http://localhost:3508/byte/consulta-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PRES-001",
    "numPrestamo": "PRES-0001234567"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PRES-001",
  "autorizacion": "AUTH12345678901234",
  "numPrestamo": "PRES-0001234567",
  "saldoCapital": 25000.00,
  "saldoInteres": 1250.00,
  "saldoMora": 150.00,
  "saldoTotal": 26400.00,
  "proximoPago": 1500.00,
  "fechaProximoPago": "15/12/2025",
  "codRespuesta": "0",
  "descRespuesta": "Consulta exitosa"
}
```

### Ejemplo 2: Préstamo Cancelado

```bash
curl -X POST http://localhost:3508/byte/consulta-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PRES-002",
    "numPrestamo": "PRES-0002222222"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PRES-002",
  "autorizacion": "AUTH12345678901235",
  "numPrestamo": "PRES-0002222222",
  "saldoCapital": 0.00,
  "saldoInteres": 0.00,
  "saldoMora": 0.00,
  "saldoTotal": 0.00,
  "proximoPago": 0.00,
  "fechaProximoPago": "",
  "codRespuesta": "0",
  "descRespuesta": "Consulta exitosa"
}
```

### Ejemplo 3: Préstamo No Existe

```bash
curl -X POST http://localhost:3508/byte/consulta-prestamo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-PRES-003",
    "numPrestamo": "PRES-9999999999"
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-PRES-003",
  "autorizacion": "",
  "numPrestamo": "PRES-9999999999",
  "saldoCapital": 0.00,
  "saldoInteres": 0.00,
  "saldoMora": 0.00,
  "saldoTotal": 0.00,
  "proximoPago": 0.00,
  "fechaProximoPago": "",
  "codRespuesta": "001",
  "descRespuesta": "Préstamo no existe"
}
```

## Modo Mock

### Préstamos de Prueba

El servicio mock incluye 4 préstamos simulados:

| Número Préstamo | Capital | Interés | Mora | Total | Próximo Pago | Fecha |
|-----------------|---------|---------|------|-------|--------------|-------|
| PRES-0001234567 | Q25,000 | Q1,250 | Q150 | Q26,400 | Q1,500 | 15/12/2025 |
| PRES-0009876543 | Q50,000 | Q2,500 | Q0 | Q52,500 | Q3,000 | 01/01/2026 |
| PRES-0001111111 | Q5,000 | Q250 | Q50 | Q5,300 | Q500 | 10/12/2025 |
| PRES-0002222222 | Q0 | Q0 | Q0 | Q0 | Q0 | (cancelado) |

### Comportamiento del Mock

- **Latencia simulada**: 400ms para imitar tiempo de consulta
- **Validación**: Verifica que el préstamo exista en los registros simulados
- **Préstamo no existe**: Retorna código 001 con saldos en cero
- **Préstamo cancelado**: Retorna código 0 pero con todos los saldos en cero

## Integración con NestJS

### Ejemplo 1: Consulta Simple

```typescript
import { Injectable } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class PrestamosService {
  constructor(private byteService: ByteService) {}

  async obtenerEstadoPrestamo(numPrestamo: string) {
    const resultado = await this.byteService.consultaPrestamo({
      idTransaccion: `CONS-${Date.now()}`,
      numPrestamo,
    });

    if (resultado.codRespuesta !== '0') {
      throw new Error(resultado.descRespuesta);
    }

    return {
      prestamo: resultado.numPrestamo,
      deuda: {
        capital: resultado.saldoCapital,
        interes: resultado.saldoInteres,
        mora: resultado.saldoMora,
        total: resultado.saldoTotal,
      },
      proximoPago: {
        monto: resultado.proximoPago,
        fecha: resultado.fechaProximoPago,
      },
    };
  }
}
```

### Ejemplo 2: Validar Antes de Pago

```typescript
async validarSaldoAntesDeAbonar(numPrestamo: string, montoAbono: number) {
  const consulta = await this.byteService.consultaPrestamo({
    idTransaccion: `VAL-${Date.now()}`,
    numPrestamo,
  });

  if (consulta.codRespuesta !== '0') {
    throw new BadRequestException('Préstamo no encontrado');
  }

  if (consulta.saldoTotal === 0) {
    throw new BadRequestException('El préstamo ya está cancelado');
  }

  if (montoAbono > consulta.saldoTotal) {
    return {
      mensaje: 'El abono excede el saldo total',
      diferencia: montoAbono - consulta.saldoTotal,
      sugerencia: `Abonar solo Q${consulta.saldoTotal.toFixed(2)} para cancelar`,
    };
  }

  return {
    valido: true,
    saldoActual: consulta.saldoTotal,
    saldoDespuesDeAbono: consulta.saldoTotal - montoAbono,
  };
}
```

### Ejemplo 3: Dashboard de Préstamos

```typescript
async obtenerResumenPrestamos(clienteId: string) {
  const prestamos = await this.db.prestamos.findMany({
    where: { clienteId },
  });

  const resumen = await Promise.all(
    prestamos.map(async (prestamo) => {
      try {
        const consulta = await this.byteService.consultaPrestamo({
          idTransaccion: `DASH-${clienteId}-${Date.now()}`,
          numPrestamo: prestamo.numero,
        });

        return {
          numero: prestamo.numero,
          tipo: prestamo.tipo,
          estado: consulta.saldoTotal === 0 ? 'CANCELADO' : 'ACTIVO',
          saldos: {
            capital: consulta.saldoCapital,
            interes: consulta.saldoInteres,
            mora: consulta.saldoMora,
            total: consulta.saldoTotal,
          },
          proximoPago: {
            monto: consulta.proximoPago,
            fecha: consulta.fechaProximoPago,
            diasRestantes: this.calcularDiasRestantes(consulta.fechaProximoPago),
          },
          estaMoroso: consulta.saldoMora > 0,
        };
      } catch (error) {
        return {
          numero: prestamo.numero,
          error: 'No se pudo consultar el préstamo',
        };
      }
    })
  );

  return resumen;
}

private calcularDiasRestantes(fechaStr: string): number {
  if (!fechaStr) return -1;
  
  const [dia, mes, anio] = fechaStr.split('/').map(Number);
  const fechaPago = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  const diferencia = fechaPago.getTime() - hoy.getTime();
  
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}
```

### Ejemplo 4: Alertas de Mora

```typescript
async verificarPrestamosMorosos(clienteId: string) {
  const prestamos = await this.db.prestamos.findMany({
    where: { clienteId, estado: 'ACTIVO' },
  });

  const morosos = [];

  for (const prestamo of prestamos) {
    const consulta = await this.byteService.consultaPrestamo({
      idTransaccion: `MORA-${clienteId}-${Date.now()}`,
      numPrestamo: prestamo.numero,
    });

    if (consulta.saldoMora > 0) {
      morosos.push({
        prestamo: prestamo.numero,
        mora: consulta.saldoMora,
        diasAtraso: this.calcularDiasAtraso(consulta.fechaProximoPago),
        total: consulta.saldoTotal,
      });

      // Enviar notificación
      await this.notificacionService.enviarAlertaMora(clienteId, {
        prestamo: prestamo.numero,
        mora: consulta.saldoMora,
      });
    }
  }

  return {
    tieneMora: morosos.length > 0,
    prestamosMorosos: morosos,
    totalMora: morosos.reduce((sum, p) => sum + p.mora, 0),
  };
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "consultaPrestamo_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-PRE-001"
    },
    "detalle": {
      "numPrestamo": "PRES-0001234567"
    }
  }
}
```

### Response del Core

```json
{
  "consultaPrestamo_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-PRE-001"
    },
    "detalle": {
      "autorizacion": "AUTH12345678901234",
      "numPrestamo": "PRES-0001234567",
      "saldoCapital": "25000.00",
      "saldoInteres": "1250.00",
      "saldoMora": "150.00",
      "saldoTotal": "26400.00",
      "proximoPago": "1500.00",
      "fechaProximoPago": "15/12/2025",
      "codRespuesta": "0",
      "descRespuesta": "Consulta exitosa"
    }
  }
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - consultaPrestamo', () => {
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

  it('debe consultar préstamo exitosamente', async () => {
    const resultado = await service.consultaPrestamo({
      idTransaccion: 'TEST-PRES-001',
      numPrestamo: 'PRES-0001234567',
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.autorizacion).toBeTruthy();
    expect(resultado.saldoCapital).toBe(25000.00);
    expect(resultado.saldoInteres).toBe(1250.00);
    expect(resultado.saldoMora).toBe(150.00);
    expect(resultado.saldoTotal).toBe(26400.00);
    expect(resultado.proximoPago).toBe(1500.00);
    expect(resultado.fechaProximoPago).toBe('15/12/2025');
  });

  it('debe retornar error si préstamo no existe', async () => {
    const resultado = await service.consultaPrestamo({
      idTransaccion: 'TEST-PRES-002',
      numPrestamo: 'PRES-9999999999',
    });

    expect(resultado.codRespuesta).toBe('001');
    expect(resultado.descRespuesta).toBe('Préstamo no existe');
    expect(resultado.saldoTotal).toBe(0);
  });

  it('debe calcular saldo total correctamente', async () => {
    const resultado = await service.consultaPrestamo({
      idTransaccion: 'TEST-PRES-003',
      numPrestamo: 'PRES-0001234567',
    });

    const sumaSaldos = resultado.saldoCapital + resultado.saldoInteres + resultado.saldoMora;
    expect(resultado.saldoTotal).toBe(sumaSaldos);
  });

  it('debe retornar préstamo cancelado con saldos en cero', async () => {
    const resultado = await service.consultaPrestamo({
      idTransaccion: 'TEST-PRES-004',
      numPrestamo: 'PRES-0002222222',
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.saldoCapital).toBe(0);
    expect(resultado.saldoInteres).toBe(0);
    expect(resultado.saldoMora).toBe(0);
    expect(resultado.saldoTotal).toBe(0);
    expect(resultado.fechaProximoPago).toBe('');
  });
});
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numPrestamo`: No puede estar vacío

### Validaciones de Negocio

- El préstamo debe existir en el sistema
- Los saldos nunca deben ser negativos
- `saldoTotal` debe ser igual a `saldoCapital + saldoInteres + saldoMora`
- Si el préstamo está cancelado, todos los saldos deben ser cero

## Logs

### Mock Mode

```
[ByteMockService] Mock: Consultando préstamo PRES-0001234567
[ByteMockService] Mock: Consulta exitosa - Préstamo: PRES-0001234567, Saldo Capital: 25000, Saldo Interés: 1250, Saldo Mora: 150, Saldo Total: 26400, Próximo Pago: 1500, Fecha: 15/12/2025, Autorización: AUTH12345678901234
```

### Real Mode

```
[ByteService] Enviando consulta de préstamo a Byte - Préstamo: PRES-0001234567
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Código: 0, Saldo Total: 26400
```

## Consideraciones de Seguridad

### Privacidad de Datos

- ✅ Solo mostrar préstamos del cliente autenticado
- ✅ No exponer préstamos de otros clientes
- ✅ Logging sin información sensible del cliente
- ✅ JWT requerido para todas las consultas

### Control de Acceso

```typescript
async consultarPrestamoConAutorizacion(clienteId: string, numPrestamo: string) {
  // Verificar propiedad del préstamo
  const prestamo = await this.db.prestamos.findFirst({
    where: { numero: numPrestamo, clienteId },
  });

  if (!prestamo) {
    throw new ForbiddenException('No tiene acceso a este préstamo');
  }

  return this.byteService.consultaPrestamo({
    idTransaccion: `SEC-${clienteId}-${Date.now()}`,
    numPrestamo,
  });
}
```

## Troubleshooting

### Saldo Total No Coincide

**Causa**: Posible inconsistencia en el Core Byte.

**Solución**:
- Verificar que `saldoTotal = saldoCapital + saldoInteres + saldoMora`
- Si no coincide, reportar al equipo de Byte Core
- Usar el valor de `saldoTotal` como referencia

### Préstamo Cancelado Pero Aparece Saldo

**Causa**: Diferencia de centavos por redondeo.

**Solución**:
- Considerar saldos menores a Q0.10 como cancelados
- Validar con `saldoTotal < 0.10` en lugar de `=== 0`

### Fecha Próximo Pago Vacía

**Causa**: El préstamo está cancelado o no tiene cuotas pendientes.

**Solución**:
- Validar que `fechaProximoPago` no esté vacía antes de procesarla
- Para préstamos cancelados, mostrar "N/A" en lugar de fecha

### Error al Parsear Monto

**Causa**: El Core retorna strings en lugar de números.

**Solución**:
- Usar `parseFloat()` para convertir montos string a number
- Ya implementado en el servicio real con manejo de null/undefined

## Comparación con Consulta de Cuenta

| Aspecto | Consulta Préstamo | Consulta Cuenta |
|---------|-------------------|-----------------|
| Tipo | Producto de crédito | Producto de ahorro |
| Saldos | Capital, Interés, Mora | Disponible, Reservas, Bloqueado |
| Estado | Activo/Cancelado | Activo/Inactivo |
| Movimientos | Pagos realizados | Depósitos/Retiros |
| Fechas | Próximo pago | Último movimiento |

---

**Versión**: 1.0  
**Componente Byte**: #006  
**Última actualización**: Noviembre 2025
