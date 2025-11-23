import React from 'react';
import Button from '../ui/Button';
import { Edit2, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export default function UserList({ users, onEdit, onToggleStatus }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rol
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nombre}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={clsx(
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                    user.rol === 'Admin' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" :
                                        user.rol === 'Arquitecto' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" :
                                            "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                )}>
                                    {user.rol}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={clsx(
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                    user.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                                )}>
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    title="Editar"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => onToggleStatus(user)}
                                    className={clsx(
                                        "hover:text-opacity-80",
                                        user.is_active ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                    )}
                                    title={user.is_active ? "Deshabilitar" : "Habilitar"}
                                >
                                    {user.is_active ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
