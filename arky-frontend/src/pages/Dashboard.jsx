import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import clsx from 'clsx';
import Button from '../components/ui/Button';
import { Plus, UserPlus } from 'lucide-react';
import RegisterClientModal from '../components/dashboard/RegisterClientModal';

import AdminDashboard from './AdminDashboard';

// Helper para badges de estado
const getStatusBadge = (status) => {
    const styles = {
        'Borrador': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        'Negociación': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        'Finalizada': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    };
    const label = status === 'Negociación' ? 'En Negociación' : status;
    return (
        <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        )}>
            {label || 'Sin Presupuesto'}
        </span>
    );
};

export default function Dashboard() {
    const { user, token } = useAuth();
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isRegisterClientOpen, setIsRegisterClientOpen] = useState(false);
    const navigate = useNavigate();

    if (!user) return null;

    // Redirect Admin to AdminDashboard
    if (user.rol === 'Admin') {
        return <AdminDashboard />;
    }

    useEffect(() => {
        const fetchObras = async () => {
            setLoading(true);
            try {
                const response = await api.get('/obras');
                setObras(response.data.data || []);
            } catch (error) {
                console.error("Error fetching obras:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchObras();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando obras...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                        Mis Obras
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Bienvenido, {user?.nombre}
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-4">
                    {user?.rol === 'Arquitecto' && (
                        <Button
                            variant="outline"
                            onClick={() => setIsRegisterClientOpen(true)}
                            className="flex items-center"
                        >
                            <UserPlus className="h-5 w-5 mr-2" />
                            Registrar Cliente
                        </Button>
                    )}
                    {(user.rol === 'Arquitecto' || user.rol === 'Encargado') && (
                        <Link to="/create-obra">
                            <Button className="flex items-center">
                                <Plus className="h-5 w-5 mr-2" />
                                Nueva Obra
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar Obra</label>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                            placeholder="Nombre de la obra..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                        <select
                            id="status"
                            name="status"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Activa">Activa (Aprobado)</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Borrador">Borrador</option>
                            <option value="Rechazado">Rechazado</option>
                            <option value="Finalizada">Finalizada</option>
                        </select>
                    </div>

                    {/* Date Range Start */}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio (Desde)</label>
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>

                    {/* Date Range End */}
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio (Hasta)</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {obras.filter(obra => {
                    // Name Filter
                    const matchesSearch = obra.nombre.toLowerCase().includes(searchTerm.toLowerCase());

                    // Status Filter
                    let matchesStatus = true;
                    if (statusFilter !== 'Todos') {
                        if (statusFilter === 'Finalizada') {
                            matchesStatus = obra.status === 'Finalizada';
                        } else if (statusFilter === 'Activa') {
                            matchesStatus = obra.latest_budget_status === 'Aprobado' && obra.status !== 'Finalizada';
                        } else {
                            matchesStatus = obra.latest_budget_status === statusFilter && obra.status !== 'Finalizada';
                        }
                    }

                    // Date Filter
                    let matchesDate = true;
                    const obraDate = new Date(obra.fecha_inicio_estimada);
                    // Reset time part for accurate date comparison
                    obraDate.setHours(0, 0, 0, 0);

                    if (dateRange.start) {
                        const startDate = new Date(dateRange.start);
                        startDate.setHours(0, 0, 0, 0);
                        matchesDate = matchesDate && obraDate >= startDate;
                    }
                    if (dateRange.end) {
                        const endDate = new Date(dateRange.end);
                        endDate.setHours(0, 0, 0, 0);
                        matchesDate = matchesDate && obraDate <= endDate;
                    }

                    return matchesSearch && matchesStatus && matchesDate;
                }).map((obra) => (
                    <div
                        key={obra.id}
                        onClick={() => navigate(`/obras/${obra.id}`)}
                        className={clsx(
                            "bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4",
                            obra.status === 'Finalizada' ? "border-blue-500" :
                                obra.latest_budget_status === 'Aprobado' ? "border-green-500" :
                                    obra.latest_budget_status === 'Rechazado' ? "border-red-500" :
                                        obra.latest_budget_status === 'Pendiente' ? "border-yellow-500" :
                                            "border-gray-300 dark:border-gray-600" // Borrador or others
                        )}
                    >
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                {obra.status === 'Finalizada' ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                        Finalizada
                                    </span>
                                ) : obra.latest_budget_status === 'Aprobado' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                        Activa
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(obra.fecha_inicio_estimada).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                {obra.nombre}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                                {obra.direccion}
                            </p>
                            {obra.cliente_nombre && (
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                                    Cliente: {obra.cliente_nombre}
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Presupuesto</span>
                                {getStatusBadge(obra.status === 'Finalizada' ? 'Finalizada' : obra.latest_budget_status)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {obras.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay obras</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando una nueva obra.</p>
                    {(user.rol === 'Arquitecto' || user.rol === 'Encargado') && (
                        <div className="mt-6">
                            <Link to="/create-obra">
                                <Button className="inline-flex items-center">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Crear Obra
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <RegisterClientModal
                isOpen={isRegisterClientOpen}
                onClose={() => setIsRegisterClientOpen(false)}
                token={token}
            />
        </MainLayout>
    );
}
