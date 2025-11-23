import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export default function RegisterClientModal({ isOpen, onClose, token }) {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        cif_empresa: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const { addToast: showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTempPassword('');

        try {
            const response = await axios.post(
                'http://localhost:3001/api/users/architect/register-client',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTempPassword(response.data.data.tempPassword);
            showToast('Cliente registrado exitosamente', 'success');
            // No cerramos el modal inmediatamente para mostrar la contraseña temporal
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al registrar cliente', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ nombre: '', email: '', cif_empresa: '' });
        setTempPassword('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                            Registrar Nuevo Cliente
                        </h3>

                        {!tempPassword ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Nombre Completo"
                                    id="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                                <Input
                                    label="Correo Electrónico"
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Input
                                    label="CIF Empresa (Opcional)"
                                    id="cif_empresa"
                                    value={formData.cif_empresa}
                                    onChange={(e) => setFormData({ ...formData, cif_empresa: e.target.value })}
                                />

                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <Button type="submit" isLoading={isLoading} className="w-full sm:col-start-2">
                                        Registrar
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleClose} className="mt-3 w-full sm:mt-0 sm:col-start-1">
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md">
                                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                        ¡Usuario creado exitosamente!
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        Contraseña Temporal:
                                    </p>
                                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-white select-all">
                                        {tempPassword}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Comparte esta contraseña con el cliente de forma segura.
                                    </p>
                                </div>
                                <Button onClick={handleClose} className="w-full">
                                    Cerrar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
