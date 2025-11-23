# Arky Database Schema

This directory contains the complete PostgreSQL database schema for the Arky construction project management system.

## Files

- **`schema.sql`** - Complete database schema with all tables, types, indexes, and initial data

## Quick Start

### Option 1: Fresh Database Setup

To create a fresh database from scratch:

```bash
# Using psql command line
psql -U your_username -d your_database -f schema.sql

# Or using environment variables
psql $DATABASE_URL -f schema.sql
```

### Option 2: Using Node.js Script

Create a setup script:

```javascript
// setup_database.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./src/config/db');

async function setupDatabase() {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await db.query(schema);
        console.log('✅ Database schema created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating schema:', error);
        process.exit(1);
    }
}

setupDatabase();
```

Then run:
```bash
node setup_database.js
```

## Database Structure

### Core Tables

1. **User** - Main user authentication and authorization
   - Roles: Admin, Arquitecto, Cliente, Encargado
   - Includes password reset functionality

2. **arquitecto** - Extended architect-specific data
   - License number storage

3. **cliente** - Extended client-specific data
   - Company CIF/tax ID storage

4. **Obra** - Construction projects
   - Links architects and clients
   - Tracks project status (Activa, Finalizada)

5. **Presupuesto** - Budget versions
   - Supports revision workflow
   - States: Borrador, Aprobado, Rechazado, Cancelado

6. **Rubro** - Budget line items
   - Quantities, unit costs, and subtotals
   - Client feedback/observations

7. **TrackingAvance** - Progress tracking
   - Status: No Iniciado, En Progreso, Terminado, Bloqueado
   - Percentage completion (0-100)

8. **Pago** - Payment records
   - Links to projects
   - Tracks who registered the payment

9. **Avance** - Progress evidence (photos)
   - Links to rubros and obras
   - Stores image URLs

10. **Archivo** - File attachments
    - Documents, contracts, etc.
    - Metadata tracking

### Custom Types (ENUMs)

- `user_rol`: Admin, Arquitecto, Cliente, Encargado
- `obra_status`: Activa, Finalizada
- `presupuesto_estado`: Borrador, Aprobado, Rechazado, Cancelado
- `avance_estado`: No Iniciado, En Progreso, Terminado, Bloqueado

## Default Admin User

The schema includes a default admin user:

- **Email**: `admin@arky.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login in production!

## Indexes

The schema includes optimized indexes for:
- User lookups by email and role
- Project queries by architect/client
- Budget and payment queries
- File and progress tracking

## Schema Versioning

The schema includes a `schema_version` table to track database version:
- Current version: `1.0.0`
- Description: Initial complete schema with all MVP tables

## Migration from Existing Database

If you have an existing database with data, **DO NOT** run this schema directly as it will drop all tables. Instead:

1. Back up your existing database
2. Review the schema for any missing tables or columns
3. Create targeted migration scripts for specific changes

## Maintenance

### Backing Up

```bash
# Full database backup
pg_dump -U your_username your_database > backup.sql

# Schema only
pg_dump -U your_username --schema-only your_database > schema_backup.sql
```

### Restoring

```bash
psql -U your_username -d your_database < backup.sql
```

## Notes

- All timestamps use PostgreSQL's `TIMESTAMP` type with `DEFAULT NOW()`
- Monetary values use `NUMERIC(15, 2)` for precision
- Foreign keys use `ON DELETE CASCADE` where appropriate
- The schema is idempotent (can be run multiple times safely due to `DROP IF EXISTS`)
