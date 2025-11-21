import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import ThemeToggle from '../ThemeToggle';

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        // Add more links here as needed
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                                    <span className="text-white font-bold">A</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Arky</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={clsx(
                                            location.pathname === item.href
                                                ? 'border-indigo-500 text-gray-900 dark:text-white'
                                                : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="mr-4">
                                <ThemeToggle />
                            </div>
                            <div className="ml-3 relative flex items-center gap-4">
                                <div className="text-sm text-right">
                                    <p className="font-medium text-gray-900 dark:text-white">{user?.nombre}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.rol}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-white dark:bg-gray-700 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <span className="sr-only">Cerrar sesión</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
