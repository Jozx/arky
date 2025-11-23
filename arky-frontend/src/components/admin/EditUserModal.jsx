import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function EditUserModal({ isOpen, onClose, user, token, onSuccess }) {
    const [formData, setFormData] = useState({
        nombre: '',
        email: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast: showToast } = useToast();

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                email: user.email
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.patch(
                `/users/admin/users/${user.id}`,
                formData
            );

            showToast('Usuario actualizado exitosamente', 'success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al actualizar usuario', 'error');
        } finally {
            setIsLoading(false);
        }
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
                            Editar Usuario
                        </h3>

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

                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <Button type="submit" isLoading={isLoading} className="w-full sm:col-start-2">
                                    Guardar Cambios
                                </Button>
                                <Button type="button" variant="outline" onClick={onClose} className="mt-3 w-full sm:mt-0 sm:col-start-1">
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
