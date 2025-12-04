import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Agregar Idempotency-Key para métodos mutantes
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            config.headers['Idempotency-Key'] = uuidv4();
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
