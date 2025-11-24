# Módulo Byte - Retiro de Efectivo de Cuenta de Ahorro

## Descripción

El componente de retiro permite extraer efectivo de una cuenta de ahorro. Este módulo implementa el **Componente #003** de la especificación Byte.

## API Endpoint

### POST /byte/retiro-cta

Realiza un retiro de efectivo de una cuenta de ahorro.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-001235",
  "numCuenta": "1234567890",
  "montoRetiro": 500.00
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numCuenta` | string | Sí | Número de cuenta del cliente |
| `montoRetiro` | number | Sí | Monto a retirar (debe ser > 0) |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-001235",
  "autorizacion": "AUTH17329012345679",
  "codRespuesta": "0",
  "descRespuesta": "Transacción exitosa",
  "numCuenta": "1234567890",
  "nuevoSaldo": 4500.00
}
```

#### Campos del Response

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idTransaccion` | string | ID de transacción (mismo del request) |
| `autorizacion` | string | Número de autorización generado por el Core |
| `codRespuesta` | string | Código de respuesta (0 = éxito, >0 = error) |
| `descRespuesta` | string | Descripción de la respuesta |
| `numCuenta` | string | Número de cuenta procesada |
| `nuevoSaldo` | number | Nuevo saldo de la cuenta después del retiro |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Transacción exitosa |
| `001` | Cuenta no existe |
| `003` | Saldo insuficiente |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Ejemplos de Uso

### Ejemplo 1: Retiro Exitoso

```bash
curl -X POST http://localhost:3508/byte/retiro-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-RET-001",
    "numCuenta": "1234567890",
    "montoRetiro": 1000.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-RET-001",
  "autorizacion": "AUTH17329098765",
  "codRespuesta": "0",
  "descRespuesta": "Transacción exitosa",
  "numCuenta": "1234567890",
  "nuevoSaldo": 4000.00
}
```

### Ejemplo 2: Saldo Insuficiente

```bash
curl -X POST http://localhost:3508/byte/retiro-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-RET-002",
    "numCuenta": "2222222222",
    "montoRetiro": 100.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-RET-002",
  "autorizacion": "",
  "codRespuesta": "003",
  "descRespuesta": "Saldo insuficiente",
  "numCuenta": "2222222222",
  "nuevoSaldo": 0.00
}
```

### Ejemplo 3: Cuenta No Existe

```bash
curl -X POST http://localhost:3508/byte/retiro-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-RET-003",
    "numCuenta": "9999999999",
    "montoRetiro": 500.00
  }'
```

**Respuesta:**
```json
{
  "idTransaccion": "TXN-2025-RET-003",
  "autorizacion": "",
  "codRespuesta": "001",
  "descRespuesta": "Cuenta no existe",
  "numCuenta": "9999999999",
  "nuevoSaldo": 0.00
}
```

## Modo Mock

### Validaciones del Mock

El servicio mock realiza las siguientes validaciones:

1. **Cuenta Existe**: Verifica que el número de cuenta esté en las cuentas simuladas
2. **Saldo Suficiente**: Valida que el saldo actual sea mayor o igual al monto a retirar
3. **Actualización de Saldo**: Resta el monto del retiro del saldo actual

### Comportamiento del Mock

- **Latencia simulada**: 500ms para imitar red
- **Actualización en memoria**: Los retiros afectan los saldos de las cuentas de prueba
- **Autorización**: Genera número único en formato `AUTH{timestamp}{random}`

## Integración con NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class CajeroService {
  constructor(private byteService: ByteService) {}

  async procesarRetiro(numCuenta: string, monto: number) {
    const resultado = await this.byteService.retiroCta({
      idTransaccion: 'RET-' + Date.now(),
      numCuenta,
      montoRetiro: monto,
    });

    if (resultado.codRespuesta !== '0') {
      throw new Error(resultado.descRespuesta);
    }

    console.log('Retiro exitoso');
    console.log('Autorización:', resultado.autorizacion);
    console.log('Nuevo saldo:', resultado.nuevoSaldo);
    
    return resultado;
  }
}
```

## Estructura del Payload al Core Byte

### Request al Core

```json
{
  "retiroCta_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001235"
    },
    "detalle": {
      "numCuenta": "1234567890",
      "montoRetiro": "500.00"
    }
  }
}
```

### Response del Core

```json
{
  "retiroCta_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001235"
    },
    "detalle": {
      "autorizacion": "AUTH123456789",
      "codRespuesta": "0",
      "descRespuesta": "Transacción exitosa",
      "numCuenta": "1234567890",
      "nuevoSaldo": "4500.00"
    }
  }
}
```

## Testing

### Test Unitario Ejemplo

```typescript
describe('ByteMockService - retiroCta', () => {
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

  it('debe procesar retiro exitosamente', async () => {
    const resultado = await service.retiroCta({
      idTransaccion: 'TEST-RET-001',
      numCuenta: '1234567890',
      montoRetiro: 1000,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.autorizacion).toBeTruthy();
    expect(resultado.nuevoSaldo).toBe(4000); // 5000 - 1000
  });

  it('debe rechazar por saldo insuficiente', async () => {
    const resultado = await service.retiroCta({
      idTransaccion: 'TEST-RET-002',
      numCuenta: '1111111111', // Saldo: 500
      montoRetiro: 1000,
    });

    expect(resultado.codRespuesta).toBe('003');
    expect(resultado.descRespuesta).toBe('Saldo insuficiente');
    expect(resultado.nuevoSaldo).toBe(500); // Saldo sin cambios
  });

  it('debe rechazar cuenta inexistente', async () => {
    const resultado = await service.retiroCta({
      idTransaccion: 'TEST-RET-003',
      numCuenta: '9999999999',
      montoRetiro: 100,
    });

    expect(resultado.codRespuesta).toBe('001');
    expect(resultado.descRespuesta).toBe('Cuenta no existe');
  });
});
```

## Validaciones

### Validaciones de Entrada

- `idTransaccion`: No puede estar vacío
- `numCuenta`: No puede estar vacío
- `montoRetiro`: Debe ser mayor a 0

### Validaciones de Negocio

- La cuenta debe existir en el sistema
- El saldo debe ser suficiente para el retiro
- El monto debe ser válido (positivo)

## Logs

### Mock Mode

```
[ByteMockService] Mock: Procesando retiro para cuenta 1234567890
[ByteMockService] Mock: Retiro exitoso - Cuenta: 1234567890, Monto: 1000, Nuevo saldo: 4000, Autorización: AUTH17329098765
```

### Real Mode

```
[ByteService] Enviando retiro a Byte - Cuenta: 1234567890, Monto: 1000
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Código: 0
```

## Casos de Uso Comunes

### 1. Retiro en Cajero Automático

```typescript
async retirarEnCajero(tarjeta: string, pin: string, monto: number) {
  // Validar tarjeta y PIN...
  const numCuenta = await this.obtenerCuentaDeTarjeta(tarjeta);
  
  const resultado = await this.byteService.retiroCta({
    idTransaccion: `ATM-${Date.now()}`,
    numCuenta,
    montoRetiro: monto,
  });
  
  if (resultado.codRespuesta === '0') {
    await this.dispensarEfectivo(monto);
    await this.imprimirRecibo(resultado);
  } else {
    throw new Error(resultado.descRespuesta);
  }
  
  return resultado;
}
```

### 2. Retiro en Ventanilla

```typescript
async retirarEnVentanilla(numCuenta: string, monto: number, cajero: string) {
  const resultado = await this.byteService.retiroCta({
    idTransaccion: `VNT-${cajero}-${Date.now()}`,
    numCuenta,
    montoRetiro: monto,
  });
  
  if (resultado.codRespuesta !== '0') {
    throw new BadRequestException(resultado.descRespuesta);
  }
  
  await this.registrarMovimiento({
    tipo: 'RETIRO_VENTANILLA',
    cajero,
    autorizacion: resultado.autorizacion,
    monto,
    nuevoSaldo: resultado.nuevoSaldo,
  });
  
  return resultado;
}
```

## Troubleshooting

### Error: Saldo Insuficiente

**Causa**: La cuenta no tiene fondos suficientes para el retiro.

**Solución**: 
- Verificar saldo antes de intentar retiro
- Solicitar monto menor
- En mock, resetear cuentas con `byteMockService.resetCuentas()`

### Error: Cuenta No Existe

**Causa**: El número de cuenta no está registrado.

**Solución**:
- Verificar que el número de cuenta sea correcto
- En mock, usar una de las cuentas predefinidas (ver docs depósito)

### Timeout de Servicio

**Causa**: El Core Byte no responde en 30 segundos.

**Solución**:
- Verificar conectividad de red
- Revisar estado del servicio Byte
- Verificar URL_BYTE en configuración

## Diferencias con Depósito

| Aspecto | Depósito | Retiro |
|---------|----------|--------|
| Operación | Suma al saldo | Resta del saldo |
| Campos | Permite efectivo y cheque | Solo monto total |
| Validación | Suma de montos = total | Saldo suficiente |
| Uso común | Ventanilla, depósito remoto | Cajero, ventanilla |

## Seguridad

- ✅ Autenticación JWT requerida
- ✅ Validación de saldo antes de procesar
- ✅ Logging de todas las transacciones
- ✅ Timeout de 30 segundos
- ✅ Autorización única por transacción

---

**Versión**: 1.0  
**Componente Byte**: #003  
**Última actualización**: Noviembre 2025
