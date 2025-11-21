-- Migration: Add missing columns to Cliente and Arquitecto tables
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS cif_empresa VARCHAR(255);
ALTER TABLE arquitecto ADD COLUMN IF NOT EXISTS numero_licencia VARCHAR(255);
