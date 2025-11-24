# Módulo Byte - Depósitos a Cuenta

## Descripción

El módulo Byte proporciona integración con el Core bancario para realizar operaciones de depósito a cuentas de ahorro, ya sea en efectivo o cheque. Este módulo implementa el **Componente #002** de la especificación Byte.

## Características

- ✅ Depósito a cuenta con efectivo o cheque
- ✅ Validación de datos con class-validator
- ✅ Modo mock automático para desarrollo/testing
- ✅ Documentación Swagger completa
- ✅ Manejo de errores y timeouts
- ✅ Logging detallado de transacciones

## Configuración

### Variables de Entorno

Agregar a los archivos `.env`:

```bash
# URL del servicio Byte
URL_BYTE=http://localhost:4000

# En producción usar la URL real:
# URL_BYTE=https://byte.production.com
```

### Modo Mock vs Modo Real

El servicio detecta automáticamente si debe usar respuestas simuladas:

- **Modo Mock**: Si `URL_BYTE` contiene "localhost" o no está configurada
- **Modo Real**: Si `URL_BYTE` apunta a un servidor externo

## API Endpoints

### POST /byte/deposito-cta

Realiza un depósito a una cuenta de ahorro.

#### Request Body

```json
{
  "idTransaccion": "TXN-2025-001234",
  "numCuenta": "1234567890",
  "montoEfectivo": 500.00,
  "montoCheque": 1000.00,
  "montoTotal": 1500.00
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idTransaccion` | string | Sí | ID único de transacción generado por MAC Génesis |
| `numCuenta` | string | Sí | Número de cuenta del cliente |
| `montoEfectivo` | number | No | Monto depositado en efectivo |
| `montoCheque` | number | No | Monto depositado en cheque |
| `montoTotal` | number | Sí | Monto total del depósito (debe ser > 0) |

#### Response Success (200 OK)

```json
{
  "idTransaccion": "TXN-2025-001234",
  "autorizacion": "AUTH17329012345678",
  "codRespuesta": "0",
  "descRespuesta": "Transacción exitosa",
  "numCuenta": "1234567890",
  "nuevoSaldo": 6500.00
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
| `nuevoSaldo` | number | Nuevo saldo de la cuenta después del depósito |

#### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `0` | Transacción exitosa |
| `001` | Cuenta no existe |
| `002` | Monto total no coincide con suma de montos |
| `003` | Error de validación |

#### Errores HTTP

- **400 Bad Request**: Datos de entrada inválidos
- **503 Service Unavailable**: Servicio Byte no disponible

## Modo Mock (Desarrollo/Testing)

### Cuentas de Prueba

El mock incluye cuentas predefinidas con saldos iniciales:

| Número de Cuenta | Saldo Inicial |
|------------------|---------------|
| `1234567890` | Q5,000.00 |
| `0987654321` | Q10,000.00 |
| `1111111111` | Q500.00 |
| `2222222222` | Q0.00 |

### Características del Mock

1. **Validación Realista**
   - Verifica que la cuenta existe
   - Valida que `montoTotal = montoEfectivo + montoCheque`
   - Actualiza saldos en memoria

2. **Simulación de Latencia**
   - Delay de 500ms para simular latencia de red
   - Respuestas consistentes con el Core real

3. **Generación de Autorizaciones**
   - Formato: `AUTH` + timestamp + número aleatorio
   - Ejemplo: `AUTH17329012345678`

4. **Métodos de Testing**
   ```typescript
   // Reiniciar cuentas a saldos iniciales
   byteMockService.resetCuentas();
   
   // Obtener saldo actual (solo en mock)
   const saldo = byteMockService.getSaldo('1234567890');
   ```

## Ejemplos de Uso

### Ejemplo 1: Depósito en Efectivo

```bash
curl -X POST http://localhost:3508/byte/deposito-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-001",
    "numCuenta": "1234567890",
    "montoEfectivo": 1000.00,
    "montoTotal": 1000.00
  }'
```

### Ejemplo 2: Depósito en Cheque

```bash
curl -X POST http://localhost:3508/byte/deposito-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-002",
    "numCuenta": "0987654321",
    "montoCheque": 5000.00,
    "montoTotal": 5000.00
  }'
```

### Ejemplo 3: Depósito Mixto (Efectivo + Cheque)

```bash
curl -X POST http://localhost:3508/byte/deposito-cta \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idTransaccion": "TXN-2025-003",
    "numCuenta": "1111111111",
    "montoEfectivo": 500.00,
    "montoCheque": 1500.00,
    "montoTotal": 2000.00
  }'
```

## Integración con NestJS

### Inyección del Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { ByteService } from '../byte/byte.service';

@Injectable()
export class MiServicio {
  constructor(private byteService: ByteService) {}

  async realizarDeposito() {
    const resultado = await this.byteService.depositoCta({
      idTransaccion: 'TXN-' + Date.now(),
      numCuenta: '1234567890',
      montoEfectivo: 1000,
      montoTotal: 1000,
    });

    console.log('Autorización:', resultado.autorizacion);
    console.log('Nuevo saldo:', resultado.nuevoSaldo);
  }
}
```

## Estructura del Payload al Core Byte

Cuando se conecta al Core real (no mock), el servicio envía:

```json
{
  "depositoCta_request": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001234"
    },
    "detalle": {
      "numCuenta": "1234567890",
      "montoEfectivo": "500.00",
      "montoCheque": "1000.00",
      "montoTotal": "1500.00"
    }
  }
}
```

Y espera respuesta:

```json
{
  "depositoCta_response": {
    "infoTx": {
      "idTransaccion": "TXN-2025-001234"
    },
    "detalle": {
      "autorizacion": "AUTH123456789",
      "codRespuesta": "0",
      "descRespuesta": "Transacción exitosa",
      "numCuenta": "1234567890",
      "nuevoSaldo": "6500.00"
    }
  }
}
```

## Logs

El módulo genera logs detallados:

```
[ByteMockService] 🔧 ByteMockService activo - Usando respuestas simuladas
[ByteMockService] Mock: Procesando depósito para cuenta 1234567890
[ByteMockService] Mock: Depósito exitoso - Cuenta: 1234567890, Monto: 1000, Nuevo saldo: 6000, Autorización: AUTH17329012345678
```

En modo real:

```
[ByteService] ✓ Servicio Byte configurado: https://byte.production.com
[ByteService] Enviando depósito a Byte - Cuenta: 1234567890, Monto: 1000
[ByteService] Respuesta Byte - Autorización: AUTH123456789, Código: 0
```

## Testing

### Test Unitario Ejemplo

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ByteMockService } from './byte-mock.service';
import { ConfigService } from '@nestjs/config';

describe('ByteMockService', () => {
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

  it('debe procesar depósito exitosamente', async () => {
    const resultado = await service.depositoCta({
      idTransaccion: 'TEST-001',
      numCuenta: '1234567890',
      montoEfectivo: 1000,
      montoTotal: 1000,
    });

    expect(resultado.codRespuesta).toBe('0');
    expect(resultado.autorizacion).toBeTruthy();
    expect(resultado.nuevoSaldo).toBe(6000); // 5000 + 1000
  });

  it('debe rechazar cuenta inexistente', async () => {
    const resultado = await service.depositoCta({
      idTransaccion: 'TEST-002',
      numCuenta: '9999999999',
      montoTotal: 1000,
    });

    expect(resultado.codRespuesta).toBe('001');
    expect(resultado.descRespuesta).toBe('Cuenta no existe');
  });
});
```

## Arquitectura

```
byte/
├── dto/
│   ├── deposito-cta.dto.ts    # DTOs con validaciones
│   └── index.ts
├── byte.controller.ts          # Controlador REST
├── byte.service.ts             # Servicio principal (Core real)
├── byte-mock.service.ts        # Servicio mock para desarrollo
└── byte.module.ts              # Módulo NestJS
```

## Seguridad

- ✅ Autenticación JWT requerida (Bearer token)
- ✅ Validación de DTOs con class-validator
- ✅ Timeout de 30 segundos en llamadas HTTP
- ✅ Logging de todas las transacciones
- ✅ Manejo de errores con códigos HTTP apropiados

## Próximas Implementaciones

Componentes adicionales del Core Byte por implementar:

- [ ] Retiro de ahorro (Componente #003)
- [ ] Transferencia entre cuentas propias (Componente #004)
- [ ] Transferencia a terceros (Componente #005)
- [ ] Consulta de saldo (Componente #006)
- [ ] Pago de préstamo con débito (Componente #007)
- [ ] Pago de préstamo con efectivo/cheque (Componente #008)
- [ ] Consulta de saldo de préstamo (Componente #009)
- [ ] Reversa de pago de préstamo (Componente #010)

## Troubleshooting

### El servicio no responde

1. Verificar que `URL_BYTE` esté configurada en `.env`
2. Revisar logs para ver si está en modo mock o real
3. Verificar conectividad de red al Core Byte

### Error "Monto total no coincide"

- Asegurarse que: `montoTotal = montoEfectivo + montoCheque`
- Ambos montos opcionales deben sumar el total exacto

### Error 503 Service Unavailable

- El Core Byte no está disponible
- Timeout de red (>30 segundos)
- Verificar URL_BYTE y conectividad

## Soporte

Para más información sobre la especificación completa del Core Byte, consultar la documentación oficial de MAC Génesis.

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025
