## 🔐 Crear Usuario Admin en Neon

### Paso 1: Ir a Neon SQL Editor

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Click en **"SQL Editor"**

### Paso 2: Ejecutar este SQL

Copia y pega el siguiente SQL en el editor:

```sql
-- Primero verificar si ya existe
SELECT * FROM "User" WHERE email = 'admin@arky.com';

-- Si no existe, crear el usuario admin
INSERT INTO "User" (email, password_hash, nombre, rol, is_active)
VALUES (
    'admin@arky.com',
    '$2b$10$YourHashWillBeHere',
    'Administrador',
    'Admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT id, email, nombre, rol, is_active FROM "User" WHERE email = 'admin@arky.com';
```

### Paso 3: Generar el Hash Correcto

Ejecuta esto en tu terminal local:

```bash
cd arky-api
node generate_production_admin.js
```

Esto te dará el SQL completo con el hash correcto de bcrypt.

### Paso 4: Probar Login

**Credenciales:**
- Email: `admin@arky.com`
- Password: `admin123`

⚠️ **IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer login!

---

## 🧪 Probar con Postman

### Login Request

**Method:** POST  
**URL:** `https://arky-api.onrender.com/api/users/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@arky.com",
  "password": "admin123"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@arky.com",
      "nombre": "Administrador",
      "rol": "Admin"
    }
  }
}
```

### Test Authenticated Request

Después de obtener el token, puedes probar una request autenticada:

**Method:** GET  
**URL:** `https://arky-api.onrender.com/api/users/me`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🐛 Troubleshooting

### Error 401 - Unauthorized

**Causa:** Usuario no existe o contraseña incorrecta

**Solución:**
1. Verifica que el usuario existe en Neon
2. Asegúrate de usar el hash correcto de bcrypt
3. Verifica que el password es exactamente `admin123`

### Error 404 - Not Found

**Causa:** URL incorrecta

**Solución:**
- Verifica que la URL incluye `/api`: `https://arky-api.onrender.com/api/users/login`

### Error 500 - Internal Server Error

**Causa:** Problema en el backend (probablemente base de datos)

**Solución:**
1. Revisa los logs en Render Dashboard
2. Verifica que `DATABASE_URL` está configurado correctamente
3. Verifica que la conexión a Neon funciona
