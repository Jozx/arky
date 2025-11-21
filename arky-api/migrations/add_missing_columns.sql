-- Migration: Add missing columns to Presupuesto and Rubro tables
-- Date: 2025-11-20

-- Add notas_generales column to Presupuesto table
ALTER TABLE Presupuesto 
ADD COLUMN IF NOT EXISTS notas_generales TEXT;

-- Add observaciones column to Rubro table
ALTER TABLE Rubro 
ADD COLUMN IF NOT EXISTS observaciones TEXT;
