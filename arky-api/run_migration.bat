@echo off
echo Running migration to add 'Terminado' to avance_estado enum...
echo.
echo Please run this command in your PostgreSQL client:
echo.
type migrations\add_terminado_to_enum.sql
echo.
echo.
echo Or run: psql -U postgres -d arky_db -f migrations/add_terminado_to_enum.sql
pause
