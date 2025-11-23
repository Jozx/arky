import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    const { addToast } = useToast();
    const navigate = useNavigate();

    const config = userRole === 'architect'
        ? { title: 'Registro de Arquitecto', specificFieldPlaceholder: 'Número de Licencia', buttonText: 'Registrar Arquitecto' }
        : { title: 'Registro de Cliente', specificFieldPlaceholder: 'CIF o NIF de la Empresa', buttonText: 'Registrar Cliente' };

    const handleRoleChange = (role) => {
        setUserRole(role);
        setFormData({
            nombre: '',
            email: '',
            password: '',
            confirmPassword: '',
            specificField: '',
        });
        setError('');
    };

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
                addToast('Registro exitoso. Por favor inicia sesión.', 'success');
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
                <Button
                    type="button"
                    onClick={() => handleRoleChange('architect')}
                    variant={userRole === 'architect' ? 'primary' : 'outline'}
                    className="flex-1"
                >
                    Soy Arquitecto
                </Button>
                <Button
                    type="button"
                    onClick={() => handleRoleChange('client')}
                    variant={userRole === 'client' ? 'primary' : 'outline'}
                    className="flex-1"
                >
                    Soy Cliente
                </Button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Nombre Completo"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />

                <Input
                    label="Correo Electrónico"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                    label={config.specificFieldPlaceholder}
                    type="text"
                    required
                    value={formData.specificField}
                    onChange={(e) => setFormData({ ...formData, specificField: e.target.value })}
                />

                <Input
                    label="Contraseña"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <Input
                    label="Confirmar Contraseña"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Registrando...' : config.buttonText}
                </Button>
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
                    <Link to="/login" className="w-full block">
                        <Button variant="outline" className="w-full">
                            Inicia Sesión
                        </Button>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
