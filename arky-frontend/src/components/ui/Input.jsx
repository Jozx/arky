import React from 'react';
import clsx from 'clsx';

export default function Input({
    label,
    id,
    type = 'text',
    error,
    className,
    containerClassName,
    ...props
}) {
    return (
        <div className={clsx("w-full", containerClassName)}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    className={clsx(
                        "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-150",
                        error
                            ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 dark:border-gray-600",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}
