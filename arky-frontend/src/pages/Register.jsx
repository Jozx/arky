import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';

export default function Register() {
    const [userRole, setUserRole] = useState('architect');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        specificField: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const config = userRole === 'architect'
        ? { title: 'Registro de Arquitecto', specificFieldPlaceholder: 'Número de Licencia', buttonText: 'Registrar Arquitecto' }
        : { title: 'Registro de Cliente', specificFieldPlaceholder: 'CIF o NIF de la Empresa', buttonText: 'Registrar Cliente' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        const backendRole = userRole === 'architect' ? 'Arquitecto' : 'Cliente';

        try {
            const payload = {
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password,
                rol: backendRole,
            };

            if (userRole === 'architect') {
                payload.numero_licencia = formData.specificField;
            } else {
                payload.cif_empresa = formData.specificField;
            }

            const result = await register(payload);

            if (result.success) {
                alert('Registro exitoso. Por favor inicia sesión.');
                navigate('/login');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title={config.title} subtitle="Crea una cuenta nueva">
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    type="button"
                    onClick={() => setUserRole('architect')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-150 border ${userRole === 'architect'
                        ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                >
                    Soy Arquitecto
                </button>
                <button
                    type="button"
                    onClick={() => setUserRole('client')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-150 border ${userRole === 'client'
                        ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                >
                    Soy Cliente
                </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                    <div className="mt-1">
                        <input
                            type="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{config.specificFieldPlaceholder}</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            value={formData.specificField}
                            onChange={(e) => setFormData({ ...formData, specificField: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                    <div className="mt-1">
                        <input
                            type="password"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                    <div className="mt-1">
                        <input
                            type="password"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? 'Registrando...' : config.buttonText}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            ¿Ya tienes cuenta?
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        to="/login"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Inicia Sesión
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
