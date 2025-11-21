-- Migration to add 'Terminado' value to avance_estado enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'Terminado' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'Terminado' 
        AND enumtypid = 'avance_estado'::regtype
    ) THEN
        -- Add 'Terminado' to the enum
        ALTER TYPE avance_estado ADD VALUE 'Terminado';
        RAISE NOTICE 'Added "Terminado" to avance_estado enum';
    ELSE
        RAISE NOTICE '"Terminado" already exists in avance_estado enum';
    END IF;
END $$;
