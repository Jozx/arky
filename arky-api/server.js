const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// 1. Configuración de dotenv para cargar variables de entorno (DEBE SER LO PRIMERO)
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Fallback: si no existe .env.local, intentar cargar .env (para compatibilidad)
if (process.env.NODE_ENV !== 'production' && !process.env.PG_USER && !process.env.DATABASE_URL) {
    dotenv.config(); // Carga .env por defecto
}

console.log(`🔧 Cargando configuración de: ${envFile}`);

// 2. Importar módulos que dependen de process.env
const errorHandler = require('./src/middleware/errorHandler');
const connectDB = require('./src/config/db');

// Conexión a la base de datos
connectDB();

const app = express();
const port = process.env.PORT || 3001;

// 📌 CONFIGURACIÓN DE CORS
// -------------------------------------------------------------
const allowedOrigins = [
    'http://localhost:3000', // React / Frontend
    'http://localhost:5173', // Vite / Frontend
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

// Usar el middleware CORS con las opciones configuradas
app.use(cors(corsOptions));

// Middlewares estándar de Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para servir archivos estáticos (uploads)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Rutas
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/obras', require('./src/routes/obraRoutes'));
app.use('/api/files', require('./src/routes/fileRoutes'));
app.use('/api/obras', require('./src/routes/presupuestoRoutes')); // Montaje para /:obraId/presupuestos
app.use('/api/presupuestos', require('./src/routes/presupuestoRoutes')); // Montaje para /:id/status
app.use('/api/presupuestos', require('./src/routes/rubroRoutes')); // Montaje para /:presupuestoId/rubros
app.use('/api/rubros', require('./src/routes/rubroRoutes')); // Montaje para /:rubroId/avance
app.use('/api/obras', require('./src/routes/paymentRoutes')); // Montaje para /:projectId/pagos


// Middleware de manejo de errores (siempre al final de las rutas)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Servidor API corriendo en http://localhost:${port}`);
    console.log(`CORS configurado para permitir: ${allowedOrigins.join(', ')}`);
});