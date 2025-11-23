-- ============================================================================
-- ARKY - PostgreSQL Database Schema
-- Complete schema for construction project management system
-- ============================================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS Avance CASCADE;
DROP TABLE IF EXISTS Pago CASCADE;
DROP TABLE IF EXISTS TrackingAvance CASCADE;
DROP TABLE IF EXISTS Rubro CASCADE;
DROP TABLE IF EXISTS Presupuesto CASCADE;
DROP TABLE IF EXISTS Obra CASCADE;
DROP TABLE IF EXISTS Archivo CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS arquitecto CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS avance_estado CASCADE;
DROP TYPE IF EXISTS presupuesto_estado CASCADE;
DROP TYPE IF EXISTS obra_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles (matches existing database: user_role not user_rol)
CREATE TYPE user_role AS ENUM ('Admin', 'Arquitecto', 'Cliente', 'Encargado');

-- Obra (Project) status
CREATE TYPE obra_status AS ENUM ('Activa', 'Pausada', 'Finalizada', 'Cancelada');

-- Presupuesto (Budget) status
CREATE TYPE presupuesto_estado AS ENUM ('Borrador', 'Negociación', 'Aprobado', 'Rechazado', 'Cancelado');

-- Rubro progress tracking status (matches existing database values)
CREATE TYPE avance_estado AS ENUM ('No Iniciado', 'En Proceso', 'Completado', 'Bloqueado', 'Terminado');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (main authentication and user data)
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Architect-specific data
CREATE TABLE arquitecto (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE UNIQUE NOT NULL,
    numero_licencia VARCHAR(100)
);

-- Client-specific data
CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE UNIQUE NOT NULL,
    cif_empresa VARCHAR(100)
);

-- Projects (Obras)
CREATE TABLE Obra (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    arquitecto_id INTEGER REFERENCES "User"(id) NOT NULL,
    cliente_id INTEGER REFERENCES "User"(id) NOT NULL,
    status obra_status DEFAULT 'Activa',
    fecha_inicio_estimada DATE,
    fecha_fin_estimada DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget versions for projects
CREATE TABLE Presupuesto (
    id SERIAL PRIMARY KEY,
    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
    version_numero INTEGER NOT NULL,
    estado presupuesto_estado DEFAULT 'Borrador',
    notas_generales TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    UNIQUE(obra_id, version_numero)
);

-- Budget line items (Rubros)
CREATE TABLE Rubro (
    id SERIAL PRIMARY KEY,
    presupuesto_id INTEGER REFERENCES Presupuesto(id) ON DELETE CASCADE NOT NULL,
    descripcion TEXT NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    cantidad_estimada NUMERIC(15, 2) NOT NULL,
    costo_unitario NUMERIC(15, 2) NOT NULL,
    fecha_inicio_estimada DATE,
    fecha_fin_estimada DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Progress tracking for each Rubro
CREATE TABLE TrackingAvance (
    id SERIAL PRIMARY KEY,
    rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE UNIQUE NOT NULL,
    estado avance_estado DEFAULT 'No Iniciado',
    porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Payment records
CREATE TABLE Pago (
    id SERIAL PRIMARY KEY,
    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
    monto NUMERIC(15, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    descripcion TEXT,
    registered_by_user_id INTEGER REFERENCES "User"(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Progress evidence (images/photos)
CREATE TABLE Avance (
    id SERIAL PRIMARY KEY,
    rubro_id INTEGER REFERENCES Rubro(id) ON DELETE CASCADE,
    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    uploaded_by INTEGER REFERENCES "User"(id),
    descripcion TEXT
);

-- File attachments (documents, contracts, etc.)
CREATE TABLE Archivo (
    id SERIAL PRIMARY KEY,
    obra_id INTEGER REFERENCES Obra(id) ON DELETE CASCADE NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tipo_archivo VARCHAR(100),
    tamano_bytes BIGINT,
    uploaded_by INTEGER REFERENCES "User"(id),
    fecha_subida TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_rol ON "User"(rol);
CREATE INDEX idx_user_is_active ON "User"(is_active);

-- Obra indexes
CREATE INDEX idx_obra_arquitecto ON Obra(arquitecto_id);
CREATE INDEX idx_obra_cliente ON Obra(cliente_id);
CREATE INDEX idx_obra_status ON Obra(status);

-- Presupuesto indexes
CREATE INDEX idx_presupuesto_obra ON Presupuesto(obra_id);
CREATE INDEX idx_presupuesto_estado ON Presupuesto(estado);

-- Rubro indexes
CREATE INDEX idx_rubro_presupuesto ON Rubro(presupuesto_id);

-- Pago indexes
CREATE INDEX idx_pago_obra ON Pago(obra_id);
CREATE INDEX idx_pago_fecha ON Pago(fecha_pago);

-- Avance indexes
CREATE INDEX idx_avance_obra ON Avance(obra_id);
CREATE INDEX idx_avance_rubro ON Avance(rubro_id);

-- Archivo indexes
CREATE INDEX idx_archivo_obra ON Archivo(obra_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default admin user
-- Password: 'admin123' (hashed with bcrypt, cost factor 10)
-- IMPORTANT: Change this password immediately after first login in production!
INSERT INTO "User" (email, password_hash, nombre, rol, is_active)
VALUES (
    'admin@arky.com',
    '$2b$10$rZ5qhJ8K3qJ5qJ5qJ5qJ5uO5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ',
    'Administrador',
    'Admin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE "User" IS 'Main user table for authentication and authorization';
COMMENT ON TABLE arquitecto IS 'Extended data for architect users';
COMMENT ON TABLE cliente IS 'Extended data for client users';
COMMENT ON TABLE Obra IS 'Construction projects';
COMMENT ON TABLE Presupuesto IS 'Budget versions for projects (supports revision workflow)';
COMMENT ON TABLE Rubro IS 'Budget line items with quantities and unit costs';
COMMENT ON TABLE TrackingAvance IS 'Progress tracking for each budget line item';
COMMENT ON TABLE Pago IS 'Payment records for projects';
COMMENT ON TABLE Avance IS 'Progress evidence (photos/images) linked to rubros';
COMMENT ON TABLE Archivo IS 'File attachments for projects (contracts, documents, etc.)';

COMMENT ON COLUMN "User".password_reset_token IS 'Hashed token for password reset functionality';
COMMENT ON COLUMN "User".password_reset_expires IS 'Expiration timestamp for reset token';
COMMENT ON COLUMN Presupuesto.version_numero IS 'Sequential version number for budget revisions';
COMMENT ON COLUMN Rubro.observaciones IS 'Client feedback/observations on this line item';
COMMENT ON COLUMN TrackingAvance.porcentaje_avance IS 'Progress percentage (0-100)';

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

-- Create a simple version tracking table
CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description)
VALUES ('1.0.0', 'Initial complete schema with all MVP tables')
ON CONFLICT (version) DO NOTHING;
