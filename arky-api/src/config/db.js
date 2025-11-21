// arky-api/src/config/db.js
const { Pool } = require('pg');

// Configuración de conexión usando variables de entorno
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Usar SSL en producción
});

/**
 * Función para probar la conexión a la base de datos.
 */
const connectDB = async () => {
  try {
    // El pool.connect() es la línea que fallaba
    await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    // Si la conexión falla al inicio, terminamos el proceso
    process.exit(1);
  }
};

// Exportamos la función de conexión y el pool para usarlo en los modelos.
module.exports = connectDB;

// También exportamos la capacidad de consulta del pool como 'db'
module.exports.query = (text, params) => pool.query(text, params);
module.exports.pool = pool; // Opcional, pero útil