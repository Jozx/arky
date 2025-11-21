import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import clsx from 'clsx';

// Helper para badges de estado
const getStatusBadge = (status) => {
    const styles = {
        'Borrador': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        'Negociación': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
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
    const { user } = useAuth();
    const [obras, setObras] = useState([]);
    const navigate = useNavigate();

    if (!user) return null;

    useEffect(() => {
        const fetchObras = async () => {
            try {
                const response = await api.get('/obras');
                // The API returns { status: 'success', data: [...] }
                // We need to access response.data.data to get the array of obras
                setObras(response.data.data || []);
            } catch (error) {
                console.error("Error fetching obras:", error);
            }
        };
        fetchObras();
    }, []);

    return (
        <MainLayout>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                        Mis Obras
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    {(user.rol === 'Arquitecto' || user.rol === 'Encargado') && (
                        <button
                            onClick={() => navigate('/create-obra')}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Nueva Obra
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {obras.map((obra) => (
                    <div
                        key={obra.id}
                        onClick={() => navigate(`/obras/${obra.id}`)}
                        className={clsx(
                            "bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4",
                            obra.latest_budget_status === 'Aprobado' ? "border-green-500" :
                                obra.latest_budget_status === 'Rechazado' ? "border-red-500" :
                                    obra.latest_budget_status === 'Pendiente' ? "border-yellow-500" :
                                        "border-gray-300 dark:border-gray-600" // Borrador or others
                        )}
                    >
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={clsx(
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                    obra.status === 'Activa' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                )}>
                                    {obra.status}
                                </span>
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
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Presupuesto</span>
                                {getStatusBadge(obra.latest_budget_status)}
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
                            <button
                                onClick={() => navigate('/create-obra')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Crear Obra
                            </button>
                        </div>
                    )}
                </div>
            )}
        </MainLayout>
    );
}

