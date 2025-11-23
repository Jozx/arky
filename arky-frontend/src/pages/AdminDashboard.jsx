import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import Button from '../components/ui/Button';
import { UserPlus } from 'lucide-react';
import UserList from '../components/admin/UserList';
import RegisterArchitectModal from '../components/admin/RegisterArchitectModal';
import EditUserModal from '../components/admin/EditUserModal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { addToast: showToast } = useToast();

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/admin/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userToToggle) => {
        try {
            await api.patch(
                `/users/admin/users/${userToToggle.id}/status`,
                { is_active: !userToToggle.is_active }
            );
            showToast(`Usuario ${userToToggle.is_active ? 'deshabilitado' : 'habilitado'} correctamente`, 'success');
            fetchUsers();
        } catch (error) {
            showToast('Error al cambiar estado del usuario', 'error');
        }
    };

    return (
        <MainLayout>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                        Gestión de Usuarios
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Administra arquitectos y clientes de la plataforma.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Button
                        onClick={() => setIsRegisterOpen(true)}
                        className="flex items-center"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Registrar Nuevo Arquitecto
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Cargando usuarios...
                    </div>
                ) : (
                    <UserList
                        users={users}
                        onEdit={setEditingUser}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </div>

            <RegisterArchitectModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                token={token}
                onSuccess={fetchUsers}
            />

            <EditUserModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                token={token}
                onSuccess={fetchUsers}
            />
        </MainLayout>
    );
}
