import React from 'react';
import ThemeToggle from '../ThemeToggle';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Placeholder for Logo */}
                <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">A</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200">
                    {children}
                </div>
            </div>
        </div>
    );
}
