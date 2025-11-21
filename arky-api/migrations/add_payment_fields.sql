-- Migration: Add payment tracking fields to Pago table
-- Date: 2025-11-21

-- Add descripcion column to Pago table
ALTER TABLE Pago 
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Add registered_by_user_id column to Pago table
ALTER TABLE Pago 
ADD COLUMN IF NOT EXISTS registered_by_user_id INTEGER REFERENCES "User"(id);

-- Remove unused columns (optional - comment out if you want to keep them for future use)
-- ALTER TABLE Pago DROP COLUMN IF EXISTS metodo;
-- ALTER TABLE Pago DROP COLUMN IF EXISTS recibo_url;
