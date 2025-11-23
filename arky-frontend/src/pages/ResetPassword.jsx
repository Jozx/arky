import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import axios from 'axios';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.patch(`http://localhost:3001/api/users/reset-password/${token}`, { password });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Restablecer Contraseña"
            subtitle="Ingresa tu nueva contraseña"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Nueva Contraseña"
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                    label="Confirmar Contraseña"
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Cambiar Contraseña
                </Button>
            </form>
        </AuthLayout>
    );
}
