# 📚 DOCUMENTACIÓN API - SISTEMA DE USUARIOS Y EMPLEADOS

Base URL: http://localhost:8000/api/usuarios/

---

## 🔐 AUTENTICACIÓN

### 1. LOGIN (Público)
**POST** /api/usuarios/login/

```json
// Request Body:
{
    "username": "admin",
    "password": "password123"
}

// Response (200 OK):
{
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "correo": "admin@example.com",
        "tipo_usuario": "administrador"
    }
}

// Response Error (401 Unauthorized):
{
    "error": "Credenciales inválidas"
}
```

**Nota:** Guarda el token para usarlo en las siguientes peticiones.

---

## 👥 USUARIOS

**HEADERS para rutas protegidas:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 2. LISTAR USUARIOS ACTIVOS (Protegida)
**GET** /api/usuarios/

```json
// Response (200 OK):
[
    {
        "id": 1,
        "username": "admin",
        "correo": "admin@example.com",
        "tipo_usuario": "administrador",
        "estado": true
    },
    {
        "id": 2,
        "username": "usuario1",
        "correo": "usuario1@example.com",
        "tipo_usuario": "empleado",
        "estado": true
    }
]
```

### 3. LISTAR TODOS LOS USUARIOS (Protegida)
**GET** /api/usuarios/todos/

```json
// Response (200 OK):
[
    {
        "id": 1,
        "username": "admin",
        "correo": "admin@example.com",
        "tipo_usuario": "administrador",
        "estado": true
    },
    {
        "id": 3,
        "username": "usuario_eliminado",
        "correo": "eliminado@example.com",
        "tipo_usuario": "empleado",
        "estado": false
    }
]
```

### 4. CREAR USUARIO (Público)
**POST** /api/usuarios/crear/

```json
// Request Body:
{
    "username": "nuevousuario",
    "correo": "nuevo@example.com",
    "password": "password123",
    "tipo_usuario": "empleado"
}

// Response (201 Created):
{
    "id": 4,
    "username": "nuevousuario",
    "correo": "nuevo@example.com",
    "tipo_usuario": "empleado",
    "estado": true
}

// Response Error (400 Bad Request):
{
    "username": ["Este username ya está en uso"],
    "correo": ["Este correo ya está en uso"]
}
```

### 5. OBTENER USUARIO POR ID (Protegida)
**GET** /api/usuarios/5/

```json
// Response (200 OK):
{
    "id": 5,
    "username": "usuario5",
    "correo": "usuario5@example.com",
    "tipo_usuario": "empleado",
    "estado": true
}

// Response Error (404 Not Found):
{
    "error": "Usuario no encontrado o inactivo"
}
```

### 6. EDITAR USUARIO (Protegida)
**PUT** /api/usuarios/5/editar/

```json
// Request Body (todos los campos o solo algunos):
{
    "correo": "nuevocorreo@example.com",
    "tipo_usuario": "supervisor"
}

// Response (200 OK):
{
    "id": 5,
    "username": "usuario5",
    "correo": "nuevocorreo@example.com",
    "tipo_usuario": "supervisor",
    "estado": true
}
```

### 7. ELIMINAR USUARIO - Eliminación Lógica (Protegida)
**DELETE** /api/usuarios/5/eliminar/

```json
// Response (200 OK):
{
    "message": "Usuario eliminado correctamente (eliminación lógica)"
}

// Response Error (404 Not Found):
{
    "error": "Usuario no encontrado o ya está inactivo"
}
```

### 8. RESTAURAR USUARIO (Protegida)
**POST** /api/usuarios/5/restaurar/

```json
// Response (200 OK):
{
    "message": "Usuario restaurado correctamente",
    "usuario": {
        "id": 5,
        "username": "usuario5",
        "correo": "usuario5@example.com",
        "tipo_usuario": "empleado",
        "estado": true
    }
}

// Response Error (404 Not Found):
{
    "error": "Usuario no encontrado o ya está activo"
}
```

---

## 👔 EMPLEADOS

### 9. LISTAR EMPLEADOS ACTIVOS (Protegida)
**GET** /api/usuarios/empleados/

```json
// Response (200 OK):
[
    {
        "id": 1,
        "usuario": 2,
        "usuario_username": "juan.perez",
        "usuario_correo": "juan@example.com",
        "nombre_completo": "Juan Pérez García",
        "telefono": "77123456",
        "ci": "12345678",
        "rol": "Vendedor",
        "direccion": "Av. Principal #123",
        "fecha_contratacion": "2024-01-15",
        "salario": "3500.00",
        "estado": true
    }
]
```

### 10. LISTAR TODOS LOS EMPLEADOS (Protegida)
**GET** /api/usuarios/empleados/todos/

```json
// Response (200 OK):
[
    {
        "id": 1,
        "usuario": 2,
        "usuario_username": "juan.perez",
        "usuario_correo": "juan@example.com",
        "nombre_completo": "Juan Pérez García",
        "telefono": "77123456",
        "ci": "12345678",
        "rol": "Vendedor",
        "direccion": "Av. Principal #123",
        "fecha_contratacion": "2024-01-15",
        "salario": "3500.00",
        "estado": true
    },
    {
        "id": 2,
        "usuario": null,
        "usuario_username": null,
        "usuario_correo": null,
        "nombre_completo": "María López",
        "telefono": "77654321",
        "ci": "87654321",
        "rol": "Cajera",
        "direccion": "Calle Falsa #456",
        "fecha_contratacion": "2024-02-20",
        "salario": "3000.00",
        "estado": false
    }
]
```

### 11. CREAR EMPLEADO CON USUARIO (Protegida)
**POST** /api/usuarios/empleados/crear/

```json
// Request Body:
{
    "username": "carlos.gomez",
    "correo": "carlos@example.com",
    "password": "password123",
    "tipo_usuario": "empleado",
    "nombre_completo": "Carlos Gómez Ruiz",
    "telefono": "77987654",
    "ci": "11223344",
    "rol": "Supervisor",
    "direccion": "Zona Norte #789",
    "salario": "4500.00"
}

// Response (201 Created):
{
    "id": 3,
    "usuario": 6,
    "usuario_username": "carlos.gomez",
    "usuario_correo": "carlos@example.com",
    "nombre_completo": "Carlos Gómez Ruiz",
    "telefono": "77987654",
    "ci": "11223344",
    "rol": "Supervisor",
    "direccion": "Zona Norte #789",
    "fecha_contratacion": "2024-10-25",
    "salario": "4500.00",
    "estado": true
}

// Response Error (400 Bad Request):
{
    "username": ["Este username ya está en uso"],
    "ci": ["Ya existe un empleado activo con este CI"]
}
```

### 12. CREAR EMPLEADO SIN USUARIO (Protegida)
**POST** /api/usuarios/empleados/crear-simple/

```json
// Request Body:
{
    "nombre_completo": "Ana Torres",
    "telefono": "77111222",
    "ci": "99887766",
    "rol": "Asistente",
    "direccion": "Barrio Central #321",
    "salario": "2800.00"
}

// Response (201 Created):
{
    "id": 4,
    "usuario": null,
    "usuario_username": null,
    "usuario_correo": null,
    "nombre_completo": "Ana Torres",
    "telefono": "77111222",
    "ci": "99887766",
    "rol": "Asistente",
    "direccion": "Barrio Central #321",
    "fecha_contratacion": "2024-10-25",
    "salario": "2800.00",
    "estado": true
}
```

### 13. OBTENER EMPLEADO POR ID (Protegida)
**GET** /api/usuarios/empleados/1/

```json
// Response (200 OK):
{
    "id": 1,
    "usuario": 2,
    "usuario_username": "juan.perez",
    "usuario_correo": "juan@example.com",
    "nombre_completo": "Juan Pérez García",
    "telefono": "77123456",
    "ci": "12345678",
    "rol": "Vendedor",
    "direccion": "Av. Principal #123",
    "fecha_contratacion": "2024-01-15",
    "salario": "3500.00",
    "estado": true
}

// Response Error (404 Not Found):
{
    "error": "Empleado no encontrado o inactivo"
}
```

### 14. BUSCAR EMPLEADO POR CI (Protegida)
**GET** /api/usuarios/empleados/buscar/?ci=12345678

```json
// Response (200 OK):
{
    "id": 1,
    "usuario": 2,
    "usuario_username": "juan.perez",
    "usuario_correo": "juan@example.com",
    "nombre_completo": "Juan Pérez García",
    "telefono": "77123456",
    "ci": "12345678",
    "rol": "Vendedor",
    "direccion": "Av. Principal #123",
    "fecha_contratacion": "2024-01-15",
    "salario": "3500.00",
    "estado": true
}

// Response Error (400 Bad Request):
{
    "error": "Parámetro CI requerido"
}

// Response Error (404 Not Found):
{
    "error": "Empleado no encontrado"
}
```

### 15. LISTAR EMPLEADOS POR ROL (Protegida)
**GET** /api/usuarios/empleados/rol/Vendedor/

```json
// Response (200 OK):
[
    {
        "id": 1,
        "usuario": 2,
        "usuario_username": "juan.perez",
        "usuario_correo": "juan@example.com",
        "nombre_completo": "Juan Pérez García",
        "telefono": "77123456",
        "ci": "12345678",
        "rol": "Vendedor",
        "direccion": "Av. Principal #123",
        "fecha_contratacion": "2024-01-15",
        "salario": "3500.00",
        "estado": true
    },
    {
        "id": 5,
        "usuario": 8,
        "usuario_username": "pedro.sanchez",
        "usuario_correo": "pedro@example.com",
        "nombre_completo": "Pedro Sánchez",
        "telefono": "77333444",
        "ci": "55667788",
        "rol": "Vendedor",
        "direccion": "Zona Sur #555",
        "fecha_contratacion": "2024-03-10",
        "salario": "3500.00",
        "estado": true
    }
]
```

### 16. ACTUALIZAR EMPLEADO (Protegida)
**PUT** /api/usuarios/empleados/1/actualizar/

```json
// Request Body (todos o algunos campos):
{
    "telefono": "77999888",
    "direccion": "Nueva Dirección #999",
    "salario": "4000.00",
    "rol": "Vendedor Senior"
}

// Response (200 OK):
{
    "id": 1,
    "usuario": 2,
    "usuario_username": "juan.perez",
    "usuario_correo": "juan@example.com",
    "nombre_completo": "Juan Pérez García",
    "telefono": "77999888",
    "ci": "12345678",
    "rol": "Vendedor Senior",
    "direccion": "Nueva Dirección #999",
    "fecha_contratacion": "2024-01-15",
    "salario": "4000.00",
    "estado": true
}

// Response Error (404 Not Found):
{
    "error": "Empleado no encontrado o inactivo"
}
```

### 17. ELIMINAR EMPLEADO - Eliminación Lógica (Protegida)
**DELETE** /api/usuarios/empleados/1/eliminar/

```json
// Response (200 OK):
{
    "message": "Empleado eliminado correctamente (eliminación lógica)"
}

// Response Error (404 Not Found):
{
    "error": "Empleado no encontrado o ya está inactivo"
}
```

### 18. RESTAURAR EMPLEADO (Protegida)
**POST** /api/usuarios/empleados/1/restaurar/

```json
// Response (200 OK):
{
    "message": "Empleado restaurado correctamente",
    "empleado": {
        "id": 1,
        "usuario": 2,
        "usuario_username": "juan.perez",
        "usuario_correo": "juan@example.com",
        "nombre_completo": "Juan Pérez García",
        "telefono": "77999888",
        "ci": "12345678",
        "rol": "Vendedor Senior",
        "direccion": "Nueva Dirección #999",
        "fecha_contratacion": "2024-01-15",
        "salario": "4000.00",
        "estado": true
    }
}

// Response Error (404 Not Found):
{
    "error": "Empleado no encontrado o ya está activo"
}
```

---

## 🔧 EJEMPLO DE USO CON cURL

### Login:
```bash
curl -X POST http://localhost:8000/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Crear Empleado (con token):
```bash
curl -X POST http://localhost:8000/api/usuarios/empleados/crear/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "username": "nuevo.empleado",
    "correo": "nuevo@example.com",
    "password": "password123",
    "tipo_usuario": "empleado",
    "nombre_completo": "Nuevo Empleado Test",
    "telefono": "77555666",
    "ci": "44556677",
    "rol": "Cajero",
    "direccion": "Test #123",
    "salario": "3200.00"
  }'
```

### Listar Empleados (con token):
```bash
curl -X GET http://localhost:8000/api/usuarios/empleados/ \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📝 NOTAS IMPORTANTES

1. **Todas las rutas protegidas requieren el header Authorization con el token JWT**
2. **El token se obtiene en el endpoint de login**
3. **Las eliminaciones son LÓGICAS, no físicas (campo estado = False)**
4. **Solo se listan registros activos por defecto, usar /todos/ para ver todos**
5. **La contraseña se hashea automáticamente al crear usuarios**
6. **El campo salario es opcional al crear empleados**
7. **El usuario asociado al empleado es opcional**

---

## 🚨 CÓDIGOS DE ESTADO HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en los datos enviados
- **401 Unauthorized**: Token inválido o no proporcionado
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

---

✅ **Fin de la documentación**