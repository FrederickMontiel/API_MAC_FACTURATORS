# Control de Errores - API Byte

## Resumen de Mejoras Implementadas

Se ha implementado un **sistema completo de control de errores** para todos los endpoints de Byte, garantizando robustez y claridad en el manejo de excepciones.

---

## 1. Excepciones Personalizadas

### Archivo: `src/byte/exceptions/byte.exceptions.ts`

#### Jerarquía de Excepciones

```
ByteException (Clase Base)
├── AccountNotFoundException (404)
├── InsufficientBalanceException (400)
├── LoanNotFoundException (404)
├── InvalidTransactionException (400)
├── AccountInactiveException (403)
├── ByteServiceUnavailableException (503)
├── ByteTimeoutException (504)
├── DuplicateTransactionException (409)
├── InvalidAmountException (400)
├── AuthorizationNotFoundException (404)
└── OperationNotAllowedException (403)
```

#### Códigos de Error

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `BYTE_001` | Cuenta/Préstamo no existe | 404 |
| `BYTE_002` | Transacción inválida | 400 |
| `BYTE_003` | Saldo insuficiente | 400 |
| `BYTE_004` | Operación no permitida | 400 |
| `BYTE_007` | Cuenta inactiva/bloqueada | 403 |
| `BYTE_503` | Servicio no disponible | 503 |
| `BYTE_TIMEOUT` | Timeout en comunicación | 504 |
| `BYTE_DUPLICATE` | Transacción duplicada | 409 |
| `BYTE_AMOUNT` | Monto inválido | 400 |
| `BYTE_AUTH_NOT_FOUND` | Autorización no encontrada | 404 |
| `BYTE_NOT_ALLOWED` | Operación no permitida | 403 |

---

## 2. Validaciones en DTOs

### Validaciones Implementadas

#### Campos de Texto
- **Longitud mínima/máxima**: IDs de transacción (5-100), números de cuenta (8-20), préstamos (5-30)
- **Formato**: Números de cuenta solo dígitos, préstamos alfanuméricos con guiones
- **Obligatoriedad**: Campos requeridos con mensajes personalizados

#### Campos Numéricos
- **Rango mínimo**: Todos los montos > Q0.01
- **Rango máximo**: 
  - Depósitos/Retiros: Q999,999.99
  - Transferencias: Q100,000.00
  - Pagos de préstamos: Q500,000.00
- **Validación condicional**: Número de cuenta requerido cuando hay débito

#### Ejemplo de Validaciones

```typescript
@IsNotEmpty({ message: 'El número de cuenta es obligatorio' })
@Length(8, 20, { message: 'El número de cuenta debe tener entre 8 y 20 dígitos' })
@Matches(/^[0-9]+$/, { message: 'El número de cuenta solo debe contener dígitos' })
numCuenta: string;

@Min(0.01, { message: 'El monto debe ser mayor a Q0.01' })
@Max(100000.00, { message: 'El monto no puede exceder Q100,000.00' })
montoTransferencia: number;
```

---

## 3. Validaciones de Negocio en ByteService

### Validaciones Previas a Llamadas a Byte

#### Depósitos (`depositoCta`)
- ✅ Suma de montos (efectivo + cheque) coincide con monto total
- ✅ Al menos un método de pago especificado
- ✅ Manejo de timeout (30 segundos)
- ✅ Validación de respuesta del Core

#### Retiros (`retiroCta`)
- ✅ Validación de estructura de respuesta
- ✅ Manejo de errores de red

#### Transferencias (`transferCta`)
- ✅ Cuentas origen y destino no pueden ser iguales
- ✅ Validación de ambas cuentas

#### Pagos de Préstamos (`pagoPrestamo`)
- ✅ Suma de métodos de pago (débito + efectivo + cheque) coincide con monto total
- ✅ Al menos un método de pago especificado
- ✅ Número de cuenta requerido cuando hay monto a debitar
- ✅ Validación condicional según método de pago

### Manejo de Errores HTTP

```typescript
private handleHttpError(error: any, operacion: string): void {
  // ECONNREFUSED → ByteServiceUnavailableException
  // ETIMEDOUT → ByteTimeoutException
  // 503 → ByteServiceUnavailableException
  // 5xx → Error del servidor
  // 400 → InvalidTransactionException
}
```

---

## 4. Respuestas de Error Documentadas en Swagger

### Estructura de Respuesta de Error

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "byteCode": "BYTE_XXX",
  "timestamp": "2025-11-26T10:00:00.000Z",
  "path": "/byte/deposito-cta",
  "method": "POST"
}
```

### Documentación por Endpoint

#### POST /byte/deposito-cta
- ✅ 200: Depósito exitoso
- ✅ 400: Monto total no coincide, datos inválidos
- ✅ 404: Cuenta no encontrada
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

#### POST /byte/retiro-cta
- ✅ 200: Retiro exitoso
- ✅ 400: Saldo insuficiente, datos inválidos
- ✅ 404: Cuenta no encontrada
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

#### POST /byte/transfer-cta
- ✅ 200: Transferencia exitosa
- ✅ 400: Cuentas iguales, saldo insuficiente
- ✅ 404: Cuenta origen/destino no encontrada
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

#### POST /byte/consulta-prestamo
- ✅ 200: Consulta exitosa
- ✅ 400: Datos inválidos
- ✅ 404: Préstamo no encontrado
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

#### POST /byte/pago-prestamo
- ✅ 200: Pago aplicado
- ✅ 400: Monto inválido, cuenta requerida, saldo insuficiente
- ✅ 404: Préstamo/cuenta no encontrada
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

#### POST /byte/reversa-pago-prestamo
- ✅ 200: Reversa aplicada
- ✅ 400: Autorización inválida
- ✅ 404: Préstamo/autorización no encontrada
- ✅ 409: Transacción duplicada
- ✅ 503: Servicio no disponible
- ✅ 504: Timeout

---

## 5. Mock Service con Excepciones

### Comportamiento del ByteMockService

El servicio mock ahora lanza **excepciones reales** en lugar de devolver códigos de error en el response, lo que permite:

1. **Testing consistente** con el servicio real
2. **Validación de manejo de errores** en desarrollo
3. **Documentación de casos de error** con ejemplos reales

#### Escenarios de Error Simulados

##### Depósitos
```typescript
// Cuenta no existe → AccountNotFoundException
await depositoCta({ numCuenta: '9999999999', ... })

// Monto no coincide → InvalidAmountException
await depositoCta({ 
  montoEfectivo: 100, 
  montoCheque: 200, 
  montoTotal: 500 // ❌ No coincide
})
```

##### Retiros
```typescript
// Saldo insuficiente → InsufficientBalanceException
await retiroCta({ 
  numCuenta: '1111111111', // Q500 disponible
  montoRetiro: 1000 // ❌ Excede saldo
})
```

##### Transferencias
```typescript
// Misma cuenta → InvalidTransactionException
await transferCta({ 
  numCuentaOrigen: '1234567890',
  numCuentaDestino: '1234567890' // ❌ Igual
})
```

##### Pagos de Préstamos
```typescript
// Débito sin cuenta → InvalidTransactionException
await pagoPrestamo({ 
  montoDebito: 500,
  numCuenta: undefined // ❌ Requerida
})

// Monto excede saldo → InvalidAmountException
await pagoPrestamo({ 
  numPrestamo: 'PRES-0001234567', // Q26,400 saldo
  montoTotal: 50000 // ❌ Excede
})
```

##### Reversas
```typescript
// Autorización no encontrada → AuthorizationNotFoundException
await reversaPagoPrestamo({ 
  autorizacionOriginal: 'AUTH99999999' // ❌ No existe
})

// Ya reversada → DuplicateTransactionException
await reversaPagoPrestamo({ 
  autorizacionOriginal: 'AUTH12345' // ❌ Ya procesada
})
```

---

## 6. Filtro Global de Excepciones

### Archivo: `src/common/filters/http-exception.filter.ts`

#### HttpExceptionFilter
- Captura todas las `HttpException`
- Formatea respuestas de manera consistente
- Registra errores con niveles apropiados (warn/error)

#### AllExceptionsFilter
- Captura errores no controlados
- Previene fugas de información sensible
- Devuelve respuestas genéricas para errores 500

### Registro en main.ts

```typescript
app.useGlobalFilters(
  new AllExceptionsFilter(), 
  new HttpExceptionFilter()
);
```

---

## 7. Validación Global de DTOs

### Configuración en main.ts

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas
    forbidNonWhitelisted: true, // Rechaza propiedades desconocidas
    transform: true, // Transforma tipos automáticamente
    transformOptions: {
      enableImplicitConversion: true, // Convierte strings a números
    },
    exceptionFactory: (errors) => {
      // Formato personalizado de errores de validación
      const messages = errors.map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));
      return {
        statusCode: 400,
        message: 'Errores de validación',
        errors: messages,
      };
    },
  }),
);
```

### Ejemplo de Error de Validación

**Request:**
```json
{
  "idTransaccion": "TX",  // ❌ Muy corto
  "numCuenta": "123ABC",  // ❌ Contiene letras
  "montoRetiro": -100     // ❌ Negativo
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "idTransaccion",
      "errors": [
        "El ID de transacción debe tener entre 5 y 100 caracteres"
      ]
    },
    {
      "field": "numCuenta",
      "errors": [
        "El número de cuenta solo debe contener dígitos"
      ]
    },
    {
      "field": "montoRetiro",
      "errors": [
        "El monto de retiro debe ser mayor a Q0.01"
      ]
    }
  ]
}
```

---

## 8. Casos de Prueba

### Testing de Errores

```bash
# 1. Cuenta no existe
curl -X POST http://localhost:3000/byte/consulta-cta \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idTransaccion": "TXN-TEST-001",
    "numCuenta": "9999999999"
  }'
# Response: 404 AccountNotFoundException

# 2. Saldo insuficiente
curl -X POST http://localhost:3000/byte/retiro-cta \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idTransaccion": "TXN-TEST-002",
    "numCuenta": "1111111111",
    "montoRetiro": 10000
  }'
# Response: 400 InsufficientBalanceException

# 3. Monto inválido
curl -X POST http://localhost:3000/byte/deposito-cta \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idTransaccion": "TXN-TEST-003",
    "numCuenta": "1234567890",
    "montoEfectivo": 100,
    "montoCheque": 200,
    "montoTotal": 500
  }'
# Response: 400 InvalidAmountException

# 4. Validación de formato
curl -X POST http://localhost:3000/byte/retiro-cta \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "idTransaccion": "TX",
    "numCuenta": "123",
    "montoRetiro": -100
  }'
# Response: 400 ValidationError
```

---

## 9. Resumen de Archivos Modificados/Creados

### Archivos Creados
- ✅ `src/byte/exceptions/byte.exceptions.ts` - Excepciones personalizadas
- ✅ `src/byte/exceptions/index.ts` - Exportaciones
- ✅ `src/common/filters/http-exception.filter.ts` - Filtros globales
- ✅ `src/common/filters/index.ts` - Exportaciones

### Archivos Modificados
- ✅ `src/byte/dto/deposito-cta.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/retiro-cta.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/consulta-cta.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/transfer-cta.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/consulta-prestamo.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/pago-prestamo.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/dto/reversa-pago-prestamo.dto.ts` - Validaciones mejoradas
- ✅ `src/byte/byte.service.ts` - Validaciones de negocio y manejo de errores
- ✅ `src/byte/byte-mock.service.ts` - Excepciones en lugar de códigos de error
- ✅ `src/byte/byte.controller.ts` - Documentación Swagger completa
- ✅ `src/main.ts` - Configuración de ValidationPipe y filtros globales

---

## 10. Beneficios Implementados

### ✅ **Robustez**
- Manejo consistente de todos los errores posibles
- Prevención de respuestas HTTP genéricas
- Validación en múltiples capas (DTO → Service → Mock)

### ✅ **Claridad**
- Mensajes de error descriptivos y específicos
- Códigos de error únicos para cada escenario
- Documentación completa en Swagger

### ✅ **Mantenibilidad**
- Excepciones reutilizables
- Separación de responsabilidades
- Fácil adición de nuevos tipos de error

### ✅ **Experiencia de Usuario**
- Respuestas JSON consistentes
- Información clara sobre qué corregir
- Timestamps para auditoría

### ✅ **Debugging**
- Logs estructurados por nivel
- Stack traces para errores 500
- Identificación rápida de problemas

---

## 11. Checklist de Control de Errores

- [x] Validaciones de formato en DTOs (longitud, regex, tipos)
- [x] Validaciones de rangos en montos
- [x] Validaciones condicionales (cuenta requerida si hay débito)
- [x] Excepciones personalizadas para cada escenario
- [x] Validaciones de negocio en servicio
- [x] Manejo de timeouts y errores de red
- [x] Validación de respuestas del Core
- [x] Documentación Swagger completa
- [x] Mock service con excepciones reales
- [x] Filtros globales de excepciones
- [x] ValidationPipe configurado con mensajes personalizados
- [x] Logs estructurados para errores

---

## Conclusión

El sistema de control de errores está **completamente implementado** y garantiza que:

1. **Ningún error pase desapercibido**
2. **Todos los errores tengan respuestas claras**
3. **El código sea fácil de mantener y extender**
4. **Los usuarios reciban información útil para corregir problemas**
5. **Los desarrolladores puedan depurar fácilmente**

La API está lista para producción con un control de errores robusto y profesional.
