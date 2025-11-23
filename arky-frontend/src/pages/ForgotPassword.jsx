import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/users/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al solicitar el reseteo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar Contraseña"
            subtitle="Ingresa tu correo para recibir un enlace de recuperación"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Correo Electrónico"
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {message && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4 text-green-800 dark:text-green-200 text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-red-800 dark:text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <Button type="submit" isLoading={isLoading} className="w-full">
                    Enviar Enlace
                </Button>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
