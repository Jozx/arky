import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ObraHeader({ obra }) {
    const navigate = useNavigate();

    return (
        <div className="mb-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 flex items-center"
            >
                ← Volver al Dashboard
            </button>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        {obra.nombre}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        {obra.direccion}
                    </p>
                    {obra.cliente_nombre && (
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Cliente: {obra.cliente_nombre}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
