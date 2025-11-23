-- Query to check the values of the avance_estado enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'avance_estado'::regtype
ORDER BY enumsortorder;
