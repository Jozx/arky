import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Iniciar Sesión"
            subtitle="Accede a tu cuenta para gestionar tus obras"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Correo Electrónico"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                    label="Contraseña"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {error}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                    </Button>
                </div>
            </form>

            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

